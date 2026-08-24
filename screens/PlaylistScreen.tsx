import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music2, Play, Pause, Search, Disc, Headset, Music, Sparkles, Mic, Filter, BookOpen, Heart, Share2, Flag, X, Loader2, Clock } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { AudioLibraryItem } from '../types';
import { ALL_SURAH_TRANSLATION_ITEMS } from '../services/surahTranslationAudioData';
import { useToast } from '../contexts/ToastContext';

const BASE_AUDIO_DATA: AudioLibraryItem[] = [
  // NADHOM KITAB
  { id: 'aqidatul_awam', category: 'nadhom', title: 'Nadhom Aqidatul Awam', artist: 'Syekh Ahmad Marzuqi', url: 'https://ia802302.us.archive.org/32/items/AqidatulAwam_201710/Aqidatul%20Awam.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'aqidatul_awam1', category: 'nadhom', title: 'Nadhom Aqidatul Awam (Lantunan Santri)', artist: 'Nadhoman Santri', url: 'https://ia801207.us.archive.org/34/items/AdhomAqidatul/adhom%20aqidatul.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'nadhom_imrithi', category: 'nadhom', title: 'Nadhom Matan Al-Imrithi (Lengkap)', artist: 'Syarafuddin Al-Imrithi', url: 'https://ia802302.us.archive.org/32/items/AqidatulAwam_201710/Aqidatul%20Awam.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'nadhom_alfiyah', category: 'nadhom', title: 'Nadhom Alfiyah Ibn Malik (Bait 1-100 Merdu)', artist: 'Ibnu Malik / Santri Tremas', url: 'https://ia801207.us.archive.org/34/items/AdhomAqidatul/adhom%20aqidatul.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_nadhom_sunda', category: 'nadhom', title: 'Nadhom Sunda Pengantar Tidur & Tafakur', artist: 'Pujogian Sunda', url: 'https://ia801503.us.archive.org/15/items/nadhoman-sunda-pengantar-tidur-sambil-tafakur/NADHOMAN%20SUNDA%20-%20PENGANTAR%20TIDUR%20SAMBIL%20TAFAKUR.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'pujian_jawa_santri', category: 'nadhom', title: 'Pujian Jawa Khas Pesantren Sebelum Shalat', artist: 'Pujian Santri', url: 'https://ia801503.us.archive.org/15/items/nadhoman-sunda-pengantar-tidur-sambil-tafakur/NADHOMAN%20SUNDA%20-%20PENGANTAR%20TIDUR%20SAMBIL%20TAFAKUR.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },

  // SHOLAWAT & NASYID
  { id: 'sholawat_habib_syech', category: 'sholawat', title: 'Album Habib Syech Terpopuler', artist: 'Habib Syech bin Abdul Qodir Assegaf', url: 'https://ia800908.us.archive.org/22/items/sholawat-habib-syech-terbaru-terlengkap-2018-terpopuler-suara-merdu-/y2mate.com%20-%20Sholawat%20Habib%20syech%20Terbaru%20Terlengkap%202018%20Terpopuler%20Suara%20Merdu%20Menyentuh%20Hati%20Umat%20Muslim.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_Khodijah', category: 'sholawat', title: 'Album Sholawat Terbaru Ai Khodijah', artist: 'Ai Khodijah', url: 'https://ia801408.us.archive.org/3/items/album-sholawat-terbaru-ai-khodijah/Album%20Sholawat%20Terbaru%20Ai%20Khodijah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_sulis_badar', category: 'sholawat', title: 'Sholawat Badar', artist: 'Sulis & Haddad Alwi', url: 'https://ia803102.us.archive.org/18/items/sulis-sholawat-badar/Sulis%20Sholawat%20Badar.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_sulis_itirof', category: 'sholawat', title: 'Al-I\'tirof (Syair Abu Nawas)', artist: 'Sulis', url: 'https://ia801807.us.archive.org/31/items/sulis-al-itiroof/Sulis%20Al%20-%20I%27tiroof.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_raihan', category: 'sholawat', title: '10 Nasyid Terbaik Raihan', artist: 'Raihan', url: 'https://ia801402.us.archive.org/10/items/full-10-lagu-nasyid-raihan-terbaik-sepanjang-zaman/%5BFULL%5D%2010%20Lagu%20Nasyid%20RAIHAN%20Terbaik%20Sepanjang%20Zaman.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_bimbo', category: 'sholawat', title: '10 Lagu Religi Terbaik Bimbo', artist: 'Bimbo', url: 'https://ia601807.us.archive.org/2/items/10-lagu-religi-terbaik-bimbo_202104/10%20Lagu%20Religi%20Terbaik%20-%20Bimbo.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_wafiq_azizah', category: 'sholawat', title: 'Album Sholawat Nabi Wafiq Azizah', artist: 'Wafiq Azizah', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_wafiq_azizah1', category: 'sholawat', title: 'Laukana Bainanal Habib', artist: 'Wafiq Azizah', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_gusaldi', category: 'sholawat', title: 'Full Album Sholawat Gus Aldi', artist: 'Gus Aldi', url: 'https://ia903405.us.archive.org/27/items/full-album-lagu-sholawat-gus-aldi-terbaru-2020/FULL%20ALBUM%20Lagu%20Sholawat%20GUS%20ALDI%20TERBARU%202020.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_akustik', category: 'sholawat', title: 'Sholawat Akustik Penyejuk Hati', artist: 'Album Akustik Islami', url: 'https://ia803204.us.archive.org/17/items/lagu-sholawat-akustik-full-album-tanpa-iklan/lagu%20sholawat%20akustik%20full%20album_Tanpa%20iklan.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_pengantar_tidur', category: 'sholawat', title: 'Sholawat Merdu Pengantar Tidur', artist: 'Penyejuk Hati', url: 'https://ia801503.us.archive.org/15/items/nadhoman-sunda-pengantar-tidur-sambil-tafakur/NADHOMAN%20SUNDA%20-%20PENGANTAR%20TIDUR%20SAMBIL%20TAFAKUR.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_sajadah_merah', category: 'sholawat', title: 'Sajadah Merah', artist: 'Aidan Munsyid', url: 'https://ia801807.us.archive.org/31/items/sulis-al-itiroof/Sulis%20Al%20-%20I%27tiroof.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_burdah', category: 'sholawat', title: 'Lirik Sholawat Burdah Merdu', artist: 'Santri Munsyid', url: 'https://ia802302.us.archive.org/32/items/AqidatulAwam_201710/Aqidatul%20Awam.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_sunda', category: 'sholawat', title: 'Sholawat Sunda Merdu Penyejuk Hati', artist: 'Sholawat Sunda', url: 'https://ia801503.us.archive.org/15/items/nadhoman-sunda-pengantar-tidur-sambil-tafakur/NADHOMAN%20SUNDA%20-%20PENGANTAR%20TIDUR%20SAMBIL%20TAFAKUR.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_ya_sayyidi', category: 'sholawat', title: 'Sholawat Ya Sayyidi', artist: 'Penyejuk Hati', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_jibril', category: 'sholawat', title: 'Sholawat Jibril Penarik Rezeki', artist: 'Penyejuk Kalbu', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_nahdliyah', category: 'sholawat', title: 'Sholawat Nahdliyah', artist: 'Paduan Suara NU', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'sholawat_nariyah', category: 'sholawat', title: 'Sholawat Nariyah (Lantunan Merdu)', artist: 'Kumpulan Doa Santri', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },

  // CERAMAH & PENGAJIAN
  { id: 'zainuddin_mz_1', category: 'ceramah', title: 'Membina Rumah Tangga Sakinah Mawaddah', artist: 'KH. Zainuddin MZ', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%2010%20Golongan%20Musuh%20Syetan.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'zainuddin_mz_2', category: 'ceramah', title: 'Hakikat Kehidupan & Bekal Akhirat', artist: 'KH. Zainuddin MZ', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%20Bahaya%20Free%20Sex.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'gus_baha_1', category: 'ceramah', title: 'Hikmah Kebijaksanaan & Kemudahan Islam', artist: 'Gus Baha (KH. Ahmad Bahauddin)', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%2010%20Golongan%20Musuh%20Syetan.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'uas_1', category: 'ceramah', title: 'Kajian Hadits & Keutamaan Sholawat Nabi', artist: 'Ustadz Abdul Somad', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%20Bahaya%20Free%20Sex.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'buya_yahya_1', category: 'ceramah', title: 'Solusi Hati Gelisah & Keberkahan Rezeki', artist: 'Buya Yahya', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%2010%20Golongan%20Musuh%20Syetan.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'anwar_zahid_1', category: 'ceramah', title: 'Pengajian Ceramah Lucu Penyejuk Hati', artist: 'KH. Anwar Zahid', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%20Bahaya%20Free%20Sex.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'abuya_uci', category: 'ceramah', title: 'Ceramah Nur Ilahi (Cilongok)', artist: 'Abuya Uci Turtusi', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%2010%20Golongan%20Musuh%20Syetan.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'habib_luthfi_1', category: 'ceramah', title: 'Cinta Tanah Air & Keutamaan Ahlul Bait', artist: 'Habib Luthfi bin Yahya', url: 'https://ia800208.us.archive.org/22/items/CeramahKH.ZainuddinMZ-Puasa/Ceramah%20KH.%20Zainuddin%20MZ%20-%20Bahaya%20Free%20Sex.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },

  // QOSIDAH & KASIDAH
  { id: 'qosidah_nasidaria', category: 'qosidah', title: 'Nasida Ria - Kumpulan Qosidah Klasik Terbaik', artist: 'Nasida Ria Semarang', url: 'https://ia800305.us.archive.org/28/items/nasida-ria-kota-santri/Nasida%20Ria%20-%20Kota%20Santri.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'qosidah_kota_santri', category: 'qosidah', title: 'Qosidah Suasana Di Kota Santri', artist: 'Nasida Ria', url: 'https://ia800305.us.archive.org/28/items/nasida-ria-kota-santri/Nasida%20Ria%20-%20Kota%20Santri.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'qosidah_burdah_lengkap', category: 'qosidah', title: 'Qasidah Burdah Imam Al-Bushiri (Full)', artist: 'Hadroh Majlis Nurul Musthofa', url: 'https://ia802302.us.archive.org/32/items/AqidatulAwam_201710/Aqidatul%20Awam.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'qosidah_simthuddurar', category: 'qosidah', title: 'Maulid Simthuddurar & Qosidah Rawi', artist: 'Habib Ali bin Muhammad Al-Habsyi', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },

  // DZIKIR & DOA
  { id: 'dzikir_ratib_haddad', category: 'dzikir', title: 'Dzikir Ratib Al-Haddad Lengkap', artist: 'Habib Umar bin Hafidz', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'dzikir_asmaul_husna', category: 'dzikir', title: 'Dzikir Asmaul Husna Merdu Penyejuk Hati', artist: 'Pena Santri', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'dzikir_istighosah', category: 'dzikir', title: 'Istighosah & Doa Khotmil Qur\'an', artist: 'Majlis Dzikir Santri', url: 'https://ia802809.us.archive.org/28/items/laukanabainanalhabibwafiqazizah/Laukana%20Bainanal%20Habib%20Wafiq%20Azizah.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
  { id: 'dzikir_pagi_petang', category: 'dzikir', title: 'Dzikir Pagi & Petang Al-Matsurat', artist: 'Dzikir Suara Merdu', url: 'https://ia801503.us.archive.org/15/items/nadhoman-sunda-pengantar-tidur-sambil-tafakur/NADHOMAN%20SUNDA%20-%20PENGANTAR%20TIDUR%20SAMBIL%20TAFAKUR.mp3', cover: 'https://i.imgur.com/3kP9dih.jpeg' },
];

const AUDIO_DATA: AudioLibraryItem[] = [
  ...BASE_AUDIO_DATA,
  ...ALL_SURAH_TRANSLATION_ITEMS
];

const PlaylistScreen: React.FC = () => {
  const navigate = useNavigate();
  const { playLibraryTrack, isPlaying, togglePlay, currentLibraryItem, mode } = useAudio();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'recent' | 'favorit' | 'terjemahan_quran' | 'nadhom' | 'sholawat' | 'ceramah' | 'qosidah' | 'dzikir'>('all');

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('santri_audio_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentAudios, setRecentAudios] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('santri_audio_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('santri_audio_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(favId => favId !== id));
      showToast("Dihapus dari audio favorit", "info");
    } else {
      setFavorites(prev => [...prev, id]);
      showToast("Disimpan ke audio favorit", "success");
    }
  };

  const handleShareAudio = (audio: AudioLibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Yuk dengarkan lantunan MP3 Islami bermanfaat ini: "${audio.title}" oleh ${audio.artist}.\n\nDengarkan di Aplikasi Santri AI! #SantriAI`;
    
    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText("Santri AI Audio", shareText);
        showToast("Teks berhasil dibagikan!", "success");
      } catch (err) {
        navigator.clipboard.writeText(shareText);
        showToast("Teks berhasil disalin ke clipboard!", "success");
      }
    } else if (navigator.share) {
      navigator.share({
        title: 'Audio Islami - Santri AI',
        text: shareText,
      }).then(() => {
        showToast("Berhasil dibagikan!", "success");
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        showToast("Teks disalin ke clipboard!", "success");
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast("Teks disalin ke clipboard!", "success");
      });
    }
  };

  // State for Audio Report Modal
  const [reportingAudio, setReportingAudio] = useState<AudioLibraryItem | null>(null);
  const [reportReason, setReportReason] = useState('audio_broken');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSendAudioReport = () => {
    if (!reportingAudio) return;
    setIsSubmittingReport(true);
    setTimeout(() => {
      showToast("Laporan audio berhasil dikirim. Terima kasih atas masukan Anda!", "success");
      setIsSubmittingReport(false);
      setReportingAudio(null);
      setReportReason('audio_broken');
      setReportDetails('');
    }, 850);
  };

  const filteredData = (() => {
    let base = AUDIO_DATA;
    if (activeCategory === 'favorit') {
      base = AUDIO_DATA.filter(item => favorites.includes(item.id));
    } else if (activeCategory === 'recent') {
      const recentItems = AUDIO_DATA.filter(item => recentAudios.includes(item.id));
      base = [...recentItems].sort((a, b) => {
        return recentAudios.indexOf(a.id) - recentAudios.indexOf(b.id);
      });
    } else if (activeCategory !== 'all') {
      base = AUDIO_DATA.filter(item => item.category === activeCategory);
    }

    return base.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  })();

  const handlePlay = (item: AudioLibraryItem) => {
    // Save to recently played list
    setRecentAudios(prev => {
      const filtered = prev.filter(id => id !== item.id);
      const updated = [item.id, ...filtered].slice(0, 25);
      localStorage.setItem('santri_audio_recent', JSON.stringify(updated));
      return updated;
    });

    if (currentLibraryItem?.id === item.id && mode === 'library') {
      togglePlay();
    } else {
      playLibraryTrack(item, filteredData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 font-sans">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 dark:from-amber-950 dark:via-amber-900 dark:to-slate-900 text-white border-b border-amber-700/50 shadow-md px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/15 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
            <Music size={20} className="text-amber-200" />
            Galeri Audio MP3
          </h2>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Hero Info - Warna diganti ke Amber/Gold gradient */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-6 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20"><Disc size={120} className="animate-spin-slow" /></div>
           <h3 className="text-xl font-bold mb-1">Dengar & Resapi</h3>
           <p className="text-amber-100 text-xs mb-4">Kumpulan Ceramah, Nadhom Kitab, Sholawat, dan Qosidah untuk menyejukkan hati.</p>
           <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/20 transition-all focus-within:bg-white focus-within:border-white group">
              <Search size={18} className="text-amber-100 group-focus-within:text-amber-600" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau pengarang..." 
                className="bg-transparent border-none outline-none text-white focus:text-amber-900 text-sm w-full placeholder:text-amber-100" 
              />
           </div>
        </div>

        {/* Quick Access: Terakhir Didengar & Favorit Saya */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveCategory(activeCategory === 'recent' ? 'all' : 'recent')}
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeCategory === 'recent'
                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-amber-200 shadow-sm'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${activeCategory === 'recent' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'}`}>
              <Clock size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs truncate">Terakhir Didengar</h4>
              <p className={`text-[10px] font-medium truncate ${activeCategory === 'recent' ? 'text-amber-100' : 'text-slate-400'}`}>
                {recentAudios.length > 0 ? `${recentAudios.length} audio` : 'Riwayat pemutaran'}
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveCategory(activeCategory === 'favorit' ? 'all' : 'favorit')}
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left ${
              activeCategory === 'favorit'
                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-amber-200 shadow-sm'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${activeCategory === 'favorit' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-500'}`}>
              <Heart size={20} className={favorites.length > 0 ? 'fill-current' : ''} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs truncate">Favorit Saya</h4>
              <p className={`text-[10px] font-medium truncate ${activeCategory === 'favorit' ? 'text-amber-100' : 'text-slate-400'}`}>
                {favorites.length > 0 ? `${favorites.length} audio` : 'Koleksi tersimpan'}
              </p>
            </div>
          </button>
        </div>

        {/* Categories - Warna tombol aktif diganti ke Amber */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {[
             { id: 'all', label: 'Semua', icon: Filter },
             { id: 'ceramah', label: 'Ceramah & Pengajian', icon: Mic },
             { id: 'sholawat', label: 'Sholawat & Nasyid', icon: Music2 },
             { id: 'nadhom', label: 'Nadhom Kitab', icon: Music },
             { id: 'qosidah', label: 'Qosidah & Kasidah', icon: Sparkles },
             { id: 'dzikir', label: 'Dzikir & Doa', icon: Headset },
             { id: 'terjemahan_quran', label: 'Murottal + Terjemahan', icon: BookOpen },
           ].map(cat => (
             <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-2 border-2 transition-all 
                  ${activeCategory === cat.id 
                    ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
             >
                <cat.icon size={14} />
                {cat.label}
             </button>
           ))}
        </div>

        {/* Audio List */}
        <div className="grid gap-3 w-full max-w-full overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Headset size={48} className="mx-auto mb-4 opacity-20" />
              <p>Audio tidak ditemukan.</p>
            </div>
          ) : filteredData.map(item => {
            const isThisPlaying = currentLibraryItem?.id === item.id && mode === 'library' && isPlaying;
            const isFav = favorites.includes(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => handlePlay(item)}
                className={`flex flex-col gap-3 p-4 rounded-3xl border transition-all duration-300 text-left cursor-pointer hover:shadow-md group max-w-full overflow-hidden box-border
                  ${isThisPlaying 
                    ? 'w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-xl ring-2 ring-amber-500/20 dark:from-amber-950 dark:to-amber-900/90 dark:border-amber-800 dark:text-white scale-[1.005]' 
                    : 'w-full bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-amber-200 shadow-sm text-slate-850 dark:text-slate-100 hover:scale-[1.005]'}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0 max-w-full overflow-hidden">
                  <div className="relative shrink-0">
                    <img 
                      src={item.cover} 
                      alt={item.title} 
                      className={`w-14 h-14 object-cover shadow-md border-2 transition-all duration-500 shrink-0
                        ${isThisPlaying 
                          ? 'rounded-full border-white/80 animate-[spin_8s_linear_infinite]' 
                          : 'rounded-xl border-transparent'}`} 
                    />
                    <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity 
                      ${isThisPlaying ? 'opacity-0 hover:opacity-100 bg-black/40' : 'opacity-0 group-hover:opacity-100 rounded-xl bg-amber-600/40'}`}
                    >
                      {isThisPlaying ? <Pause size={20} className="text-white" fill="currentColor" /> : <Play size={20} className="text-white ml-1" fill="currentColor" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden pr-1">
                    <h4 className={`font-extrabold text-sm truncate max-w-full min-w-0 block mb-0.5 ${isThisPlaying ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`} title={item.title}>
                      {item.title}
                    </h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest truncate max-w-full min-w-0 block ${isThisPlaying ? 'text-amber-100/90' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.artist}
                    </p>
                  </div>
                  {isThisPlaying && (
                     <div className="flex gap-0.5 items-end h-4 shrink-0">
                        <div className="w-1 bg-white rounded-full animate-bounce h-full"></div>
                        <div className="w-1 bg-white rounded-full animate-bounce h-2/3 [animation-delay:0.2s]"></div>
                        <div className="w-1 bg-white rounded-full animate-bounce h-1/2 [animation-delay:0.4s]"></div>
                     </div>
                  )}
                </div>

                {/* Interactive Tool Bar on playing card */}
                {isThisPlaying && (
                  <div className="flex items-center gap-2 mt-1 pt-3 border-t border-white/20 dark:border-white/10 animate-in slide-in-from-top-2 duration-200 w-full min-w-0 overflow-hidden">
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white dark:bg-white/10 dark:hover:bg-white/20 text-[11px] font-black uppercase tracking-wider transition-colors truncate"
                    >
                      <Heart size={14} className={isFav ? "fill-white text-white scale-110 shrink-0" : "text-white shrink-0"} />
                      <span className="truncate">{isFav ? 'Tersimpan' : 'Favorit'}</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleShareAudio(item, e)}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white dark:bg-white/10 dark:hover:bg-white/20 text-[11px] font-black uppercase tracking-wider transition-colors truncate"
                    >
                      <Share2 size={14} className="text-white shrink-0" />
                      <span className="truncate">Bagikan</span>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); setReportingAudio(item); }}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/20 hover:bg-red-500 text-white dark:bg-white/10 dark:hover:bg-red-500 text-[11px] font-black uppercase tracking-wider transition-colors truncate"
                    >
                      <Flag size={14} className="text-white shrink-0" />
                      <span className="truncate">Laporkan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Report Modal */}
      {reportingAudio && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-150 dark:border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setReportingAudio(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-amber-500 mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                <Flag size={20} className="fill-amber-500/10" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">Laporkan Audio</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Laporkan masalah pada pemutaran audio ini</p>
              </div>
            </div>

            <div className="mb-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1 mb-0.5">{reportingAudio.title}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{reportingAudio.artist}</p>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Pilih Alasan Pelaporan</label>
              {[
                { id: 'audio_broken', label: 'Audio rusak / tidak bersuara' },
                { id: 'wrong_link', label: 'Link audio salah / memutar file lain' },
                { id: 'bad_quality', label: 'Kualitas suara sangat buruk / kresek-kresek' },
                { id: 'copyright', label: 'Masalah hak cipta / plagiasi' },
                { id: 'other', label: 'Lainnya' }
              ].map(reason => (
                <button
                  key={reason.id}
                  onClick={() => setReportReason(reason.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all text-xs font-semibold
                    ${reportReason === reason.id
                      ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400'
                      : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/20'
                    }`}
                >
                  <span>{reason.label}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                    ${reportReason === reason.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-700'}`}
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
                  className="w-full h-20 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportingAudio(null)}
                className="py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSendAudioReport}
                disabled={isSubmittingReport}
                className="py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
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

export default PlaylistScreen;