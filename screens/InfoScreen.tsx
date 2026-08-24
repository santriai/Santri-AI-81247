
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Info, BookOpen, FileText, Shield, AlertTriangle, Phone, Mail, Globe, CheckCircle, Database, Cpu, Layers,
  ChevronDown, ChevronUp, Play, Compass, Landmark, Scale, Moon, Baby, Car, Droplet, Clock, HelpCircle, User, Tv, Radio, Music, ArrowRight, Search,
  MessageSquare, Award, Calendar, Volume2, Users, Sparkles, HeartHandshake, ShieldCheck, Gamepad2, Gift, CheckSquare, BookMarked
} from 'lucide-react';
import { APP_NAME } from '../constants';

interface GuideFeature {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  benefit: string;
  howToUse: string[];
}

const GUIDE_FEATURES: GuideFeature[] = [
  {
    id: 'bedah-kitab',
    title: 'Bedah Kitab Kuning AI',
    icon: Cpu,
    path: '/input',
    color: 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700',
    benefit: 'Memudahkan Anda menerjemahkan naskah Arab gundul (kitab klasik/turats) lengkap dengan penanda makna gandul ala pesantren tradisional Jawa/Melayu, analisis I\'rab & struktur Nahwu-Shorof, syarah kontekstual mendalam, pemindaian foto kamera (OCR), dan input suara.',
    howToUse: [
      'Buka halaman Input melalui bilah navigasi bawah atau tombol Bedah Kitab.',
      'Ketik naskah Arab, salin dari perpustakaan, gunakan rekaman suara, atau panggil ikon Kamera untuk mengambil foto lembaran kitab fisik.',
      'Lakukan pemangkasan (crop) area teks naskah jika memotret, lalu tekan tombol Bedah Kitab AI.',
      'Hasil terjemahan kata demi kata, tatanan i\'rab (mubtada-khobar/fi\'il-fa\'il), dan penjelasan syarah hikmah akan terurai secara rinci.'
    ]
  },
  {
    id: 'cerdas-cermat',
    title: 'Cerdas Cermat & Arena Versus Multiplayer',
    icon: Gamepad2,
    path: '/quiz',
    color: 'from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700',
    benefit: 'Ajang asah otak keislaman interaktif mode Solo & Arena Versus Multiplayer real-time. Meliputi kategori Fiqih, Nahwu, Sejarah Islam, Al-Quran, serta kategori audio khusus: Sambung Ayat (Audio) dan Tebak Ayat & Surat (Audio) dengan pemutar murottal langsung.',
    howToUse: [
      'Masuk ke menu Cerdas Cermat dari beranda atau bilah navigasi.',
      'Pilih mode Bermain Solo atau Arena Versus (Multiplayer) bersama santri lain.',
      'Di Arena Versus, Anda dapat membuat Room baru atau bergabung menggunakan Kode Room. Pilih topik khusus atau "Random (Acak Topik)".',
      'Jawab pertanyaan sebelum waktu habis. Pemain tercepat pertama (#1) yang menjawab benar meraih 150 Poin (100 Poin Dasar + 50 Bonus Kecepatan), sedangkan jawaban benar berikutnya memperoleh 100 Poin.',
      'Kumpulkan Poin XP dan Wasilah untuk menaikkan peringkat di Leaderboard Nasional dan menukarkan lencana kebanggaan santri.'
    ]
  },
  {
    id: 'quran-tajwid',
    title: 'Al-Quranul Karim, Murottal & Tajwid Warna',
    icon: BookOpen,
    path: '/quran',
    color: 'from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700',
    benefit: 'Mushaf Al-Quran digital 30 Juz lengkap dengan pewarnaan Tajwid visual interaktif, murottal merdu per-ayat dari para Syekh Qari terkemuka, terjemahan resmi Kemenag RI, Tafsir Jalalain, dan analisis asbabun nuzul.',
    howToUse: [
      'Gunakan navigasi Buka Al-Quran di bilah bawah.',
      'Pilih pembacaan per Surat, Juz, atau pencarian ayat spesifik.',
      'Aktifkan toggle Mode Tajwid Warna untuk memicu panduan warna (merah untuk ghunnah, hijau untuk ikhfa, biru untuk qalqalah, ungu untuk mad panjang).',
      'Sentuh tombol Play untuk mendengarkan pelafalan murottal audio per-ayat atau klik Tafsir AI untuk menyimak syarah kandungan ayat.'
    ]
  },
  {
    id: 'pustaka-kitab',
    title: 'Perpustakaan Kitab Digital & E-Book',
    icon: BookMarked,
    path: '/kitab',
    color: 'from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700',
    benefit: 'Akses tanpa batas ke khazanah ribuan kitab turats keislaman Aswaja (Safinatun Najah, Taqrib, Jurumiyah, Imrithi, Aqidatul Awam, Ta\'lim Muta\'allim, Ihya Ulumuddin) dilengkapi pembaca E-Book modern dan Bedah AI per-paragraf.',
    howToUse: [
      'Sentuh tombol Buka Pustaka Kitab.',
      'Saring berdasarkan bidang ilmu (Syariah, Aqidah, Akhlak, Alat) atau cari judul kitab di bilah pencarian.',
      'Buka bab/fasal yang ingin dipelajari.',
      'Tekan tombol Bedah AI di setiap paragraf teks Arab untuk menampilkan penjelasan syarah kontekstual instan.'
    ]
  },
  {
    id: 'bahtsul-masail',
    title: 'Bahtsul Masail & Konsultasi Fiqih AI',
    icon: MessageSquare,
    path: '/bahtsul-masail',
    color: 'from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700',
    benefit: 'Forum Bahtsul Masail digital dan layanan konsultasi hukum Islam AI 24 jam untuk menjawab permasalahan fiqih kasuistik kontemporer berlandaskan ibarat kitab-kitab mu\'tabarah Ahlussunnah wal Jama\'ah.',
    howToUse: [
      'Masuk ke menu Bahtsul Masail atau Konsultasi AI.',
      'Ketikkan pertanyaan atau permasalahan hukum syariat yang ingin dikonsultasikan secara jelas.',
      'Asisten AI akan merumuskan jawaban lengkap dengan rujukan kitab klasik, terjemahan, serta simpulan hukum yang mudah dipahami.'
    ]
  },
  {
    id: 'hadis-shahih',
    title: 'Kajian & Ensiklopedia Hadis Shahih',
    icon: Database,
    path: '/hadis',
    color: 'from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700',
    benefit: 'Koleksi ratusan hadis nabi otentik terpopuler (Arbain Nawawi, Riyadhus Shalihin, Bulughul Maram) dilengkapi teks matan Arab ber-harakat, jalur sanad, derajat hadis, dan hikmah amalan sehari-hari.',
    howToUse: [
      'Gunakan tombol navigasi Buka Kajian Hadis.',
      'Cari hadis berdasarkan klasifikasi bab tematik atau ketik kata kunci pencarian.',
      'Ketuk judul hadis untuk membaca teks Arab, terjemahan Indonesia, jalur sanad, serta faedah hukumnya.'
    ]
  },
  {
    id: 'tahfidz-mandiri',
    title: 'Asisten Setoran Hafalan (Tahfidz Mandiri)',
    icon: Layers,
    path: '/tahfidz',
    color: 'from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800',
    benefit: 'Membantu santri melakukan murojaah hafalan Al-Quran secara mandiri menggunakan metode interaktif "Tutup-Buka Ayat" guna melatih ingatan visual teks Arab secara presisi.',
    howToUse: [
      'Klik navigasi Asisten Tahfidz.',
      'Pilih Surat dan Juz target yang sedang Anda mrojaah.',
      'Aktifkan Mode Sembunyikan Ayat untuk meredupkan tulisan Arab, lalu rafalkan hafalan dalam lisan Anda.',
      'Klik Buka Kunci Ayat untuk mencocokkan kelancaran hafalan Anda dengan naskah aslinya.'
    ]
  },
  {
    id: 'doa-dzikir',
    title: 'Dzikir Rotib, Tahlil, Yasin & Kumpulan Doa',
    icon: Sparkles,
    path: '/doa',
    color: 'from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700',
    benefit: 'Panduan susunan bacaan Tahlil lengkap, Surat Yasin, Doa Nabi Yunus, Dzikir Rotib Haddad/Attas, dan doa-doa harian ber-harakat jelas lengkap dengan terjemahan dan pemutar audio.',
    howToUse: [
      'Buka menu Doa & Dzikir.',
      'Pilih kategori bacaan (Doa Harian, Tahlil & Yasin, Rotib & Dzikir).',
      'Simak teks Arab dan Latin, atau putar audio bacaan untuk memandu amalan dzikir Anda.'
    ]
  },
  {
    id: 'tasbih-digital',
    title: 'Tasbih Digital & Preset Dzikir Aswaja',
    icon: CheckCircle,
    path: '/tasbih',
    color: 'from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-800',
    benefit: 'Penghitung dzikir digital praktis dengan respon getar (haptic feedback), preset wirid (Istighfar, Sholawat, Hauqolah, Dzikir Yunus), target hitungan, dan Doa Kafaratul Majelis otomatis.',
    howToUse: [
      'Ketuk tombol Buka Tasbih & Wirid.',
      'Pilih Preset Dzikir atau atur jumlah target hitungan kustom.',
      'Sentuh area layar mana saja untuk menambah hitungan tanpa harus menatap layar.',
      'Saat hitungan mencapai target, kotak Doa Kafaratul Majelis akan meluncur di layar.'
    ]
  },
  {
    id: 'jadwal-sholat',
    title: 'Jadwal Sholat & Notifikasi Adzan GPS',
    icon: Clock,
    path: '/prayer-times',
    color: 'from-cyan-500 to-sky-600 dark:from-cyan-600 dark:to-sky-700',
    benefit: 'Menjamin ketepatan waktu ibadah sholat wajib Anda dengan kalkulasi astronomis GPS real-time, alarm kumandang adzan syahdu (Makkah, Madinah, Kairo), dan pengingat waktu Imsakiah.',
    howToUse: [
      'Buka Jadwal Sholat dan izinkan akses GPS lokasi gawai Anda.',
      'Sistem akan menghitung waktu Imsak, Subuh, Syuruq, Dzuhur, Ashar, Maghrib, dan Isya khusus lokasi Anda.',
      'Aktifkan notifikasi adzan dengan menyentuh tanda speaker/lonceng di samping baris waktu.'
    ]
  },
  {
    id: 'arah-kiblat',
    title: 'Kompas Kiblat GPS 3D',
    icon: Compass,
    path: '/qibla',
    color: 'from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700',
    benefit: 'Penunjuk arah Kiblat Ka\'bah Makkah interaktif menggunakan kompas dinamis 3D yang terkalibrasi otomatis via sensor gawai.',
    howToUse: [
      'Masuk ke halaman Arah Kiblat.',
      'Posisikan ponsel Anda secara mendatar pada telapak tangan di permukaan datar.',
      'Putar tubuh hingga ikon miniatur Ka’bah menyatu sejajar dengan garis penunjuk kiblat berwarna hijau.'
    ]
  },
  {
    id: 'kalkulator-zakat',
    title: 'Kalkulator Zakat Komprehensif',
    icon: Landmark,
    path: '/zakat',
    color: 'from-rose-500 to-pink-600 dark:from-rose-600 dark:to-pink-700',
    benefit: 'Perhitungan zakat fardhu (Zakat Maal, Profesi, Emas/Perak, Perdagangan, Tabungan) sesuai nisab dan haul syariat Islam dengan integrasi harga emas live.',
    howToUse: [
      'Pilih jenis zakat kekayaan yang dimiliki (misal Zakat Profesi atau Tabungan).',
      'Masukkan nominal rupiah atau gram emas. Sistem akan memvalidasi nisab harga emas live.',
      'Jika mencapai nisab, aplikasi akan menampilkan nominal zakat yang wajib ditunaikan.'
    ]
  },
  {
    id: 'kalkulator-waris',
    title: 'Kalkulator Faraidh & Waris Syar\'i',
    icon: Scale,
    path: '/waris',
    color: 'from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700',
    benefit: 'Menghitung secara presisi pembagian harta waris untuk para ahli waris berdasarkan dalil Fiqih Faraidh Aswaja (Ashobah, Dzawil Furudh) tanpa kerancuan porsi.',
    howToUse: [
      'Ketikkan total nilai harta peninggalan dan kurangi dengan biaya jenazah, wasiat, atau hutang.',
      'Centang daftar ahli waris keluarga yang masih hidup.',
      'Klik Analisis Pembagian Warisan untuk melihat pecahan jatah, nominal rupiah, dan status penyingkir (hijab).'
    ]
  },
  {
    id: 'kalkulator-haid',
    title: 'Kalkulator Fiqih Haid (Siklus Suci)',
    icon: Moon,
    path: '/haid',
    color: 'from-fuchsia-500 to-pink-600 dark:from-fuchsia-600 dark:to-pink-700',
    benefit: 'Pencatatan siklus bulanan wanita untuk mengklasifikasi status darah (Haid, Suci, atau Istihadhah) menurut Madzhab Syafi\'i demi keabsahan sholat fardhu.',
    howToUse: [
      'Input tanggal mulainya darah keluar dan tanggal berhentinya.',
      'Tuliskan riwayat jeda suci jika ada di tengah siklus.',
      'Sistem akan menyimpulkan status Fiqih apakah terhitung Haid (max 15 hari) atau Istihadhah.'
    ]
  },
  {
    id: 'kalkulator-nifas',
    title: 'Kalkulator Masa Nifas Melahirkan',
    icon: Baby,
    path: '/nifas',
    color: 'from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700',
    benefit: 'Mempermudah ibu pasca persalinan dalam merekam batas nifas (lahzah, 40 hari, max 60 hari) serta petunjuk bersuci mandi janabah.',
    howToUse: [
      'Pilih tanggal persalinan dan durasi keluarnya darah.',
      'Aplikasi mengkalkulasi jadwal batas nifas dan panduan hukum ibadah bersuci.'
    ]
  },
  {
    id: 'kalkulator-safar',
    title: 'Kalkulator Perjalanan & Jamak Qashar',
    icon: Car,
    path: '/travel',
    color: 'from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700',
    benefit: 'Memeriksa jarak tempuh perjalanan safar apakah memenuhi batas rukhshah (dispensasi sholat) 2 Marhalah (~82-89 km) untuk diperbolehkan Jamak dan Qashar.',
    howToUse: [
      'Masukkan jarak kilometer rute perjalanan yang direncanakan.',
      'Dapatkan analisis kelaikan rukhsah beserta panduan tata cara sholat Jamak/Qashar dan niatnya.'
    ]
  },
  {
    id: 'kalkulator-air',
    title: 'Kalkulator Batas Air (Dua Qullah)',
    icon: Droplet,
    path: '/water',
    color: 'from-blue-400 to-teal-500 dark:from-blue-500 dark:to-teal-700',
    benefit: 'Memastikan volume air bersuci di bak/wadah telah memenuhi limit Dua Qullah (~216 Liter) agar tidak dihukumi air Musta\'mal atau Mutanajjis.',
    howToUse: [
      'Pilih bentuk bejana (kubus atau tabung silinder).',
      'Masukkan ukuran dimensi bak (panjang, lebar, diameter, kedalaman) dalam cm.',
      'Sistem mengonversi ke liter dan menentukan status kesucian air secara otomatis.'
    ]
  },
  {
    id: 'kalkulator-iddah',
    title: 'Kalkulator Masa Iddah Wanita',
    icon: Clock,
    path: '/iddah',
    color: 'from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700',
    benefit: 'Mengawal masa iddah penantian akad baru bagi wanita pasca perceraian atau meninggalnya suami sesuai ketentuan hukum syariat.',
    howToUse: [
      'Tentukan jenis iddah (Cerai Mati, Cerai Hidup, Hamil, Menopause) dan tanggal kejadian.',
      'Sistem akan menerbitkan tanggal persis bebas iddah beserta panduan ihdad (pantangan).'
    ]
  },
  {
    id: 'bursa-wasilah',
    title: 'Bursa Wasilah, Toko Lencana & Frame Profile',
    icon: Award,
    path: '/badge-shop',
    color: 'from-amber-400 to-yellow-600 dark:from-amber-500 dark:to-yellow-700',
    benefit: 'Penukaran poin XP dan Wasilah dari aktivitas ibadah serta cerdas cermat untuk membuka bingkai foto profil eksklusif, lencana kebanggaan santri, dan gelar kepangkatan.',
    howToUse: [
      'Buka Toko Lencana / Frame Shop melalui menu Profil atau Toko.',
      'Pilih bingkai avatar atau lencana santri favorit Anda.',
      'Tukarkan poin Wasilah untuk memasang bingkai keren pada foto profil Anda.'
    ]
  },
  {
    id: 'absensi-harian',
    title: 'Absensi & Check-In Harian Santri',
    icon: CheckSquare,
    path: '/attendance',
    color: 'from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700',
    benefit: 'Melatih kebiasaan istiqomah dengan melakukan check-in harian untuk mengklaim poin bonus XP dan mempertahankan streak ibadah harian.',
    howToUse: [
      'Buka halaman Absensi Harian setiap hari.',
      'Ketuk tombol Klaim Poin Harian untuk mengumpulkan Poin XP dan menjaga streak keberlanjutan Anda.'
    ]
  },
  {
    id: 'kamus-munawwir',
    title: 'Kamus Munawwir & Istilah Pesantren',
    icon: Search,
    path: '/munawwir',
    color: 'from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700',
    benefit: 'Kamus Arab - Indonesia (Munawwir) digital untuk mencari kosa kata Arab, bentuk fi\'il, dan istilah-istilah fiqih/turats dengan cepat.',
    howToUse: [
      'Buka menu Kamus Munawwir.',
      'Ketikkan kata kunci dalam bahasa Indonesia atau Arab.',
      'Dapatkan akar kata, arti rinci, dan contoh penggunaannya dalam istilah pesantren.'
    ]
  },
  {
    id: 'komunitas-santri',
    title: 'Silaturahmi & Komunitas Santri',
    icon: Users,
    path: '/community',
    color: 'from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700',
    benefit: 'Wadah silaturahmi, diskusi interaktif, berbagi catatan kitab, dan tanya-jawab keilmuan antar santri dan alumni pesantren se-Indonesia.',
    howToUse: [
      'Buka menu Silaturahmi dari navigasi bawah.',
      'Tulis postingan baru, bagikan ilmu/catatan kajian, atau beri tanggapan pada postingan santri lain.'
    ]
  },
  {
    id: 'biografi-ulama',
    title: 'Biografi Tokoh & Ulama Nusantara',
    icon: User,
    path: '/biography',
    color: 'from-violet-500 to-indigo-600 dark:from-violet-600 dark:to-indigo-700',
    benefit: 'Meneladani riwayat keteladanan, adab, nasehat emas, karya kitab, dan silsilah sanad para Imam Madzhab, Sufi Agung, Wali Songo, dan Muassis NU.',
    howToUse: [
      'Pilih menu Biografi Ulama.',
      'Pilih kartu nama ulama rujukan yang ingin dipelajari.',
      'Simak nasehat, riwayat dakwah, dan karya karangan beliau yang menginspirasi.'
    ]
  },
  {
    id: 'rekreasi-spiritual',
    title: 'Live TV Makkah & Radio Aswaja 24 Jam',
    icon: Tv,
    path: '/tv-mekkah',
    color: 'from-zinc-600 to-slate-800 dark:from-zinc-700 dark:to-slate-900',
    benefit: 'Siaran langsung 24 jam Masjidil Haram Makkah & Masjid Nabawi Madinah serta streaming radio kajian kitab dan murottal Al-Quran sejuk penyejuk kalbu.',
    howToUse: [
      'Ketuk tombol Buka TV Makkah & Radio.',
      'Tekan tombol Putar di panel TV Makkah atau pilih stasiun Radio Aswaja favorit.',
      'Pastikan koneksi internet gawai Anda stabil untuk menikmati tayangan tanpa hambatan.'
    ]
  }
];

const GuideAccordion: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const filteredFeatures = GUIDE_FEATURES.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.howToUse.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-600 dark:text-slate-300">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 rounded-3xl border border-emerald-700/40 shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <h4 className="font-extrabold text-white mb-1.5 flex items-center gap-2 text-base">
          <BookOpen className="text-emerald-300 shrink-0" size={20} />
          Panduan Interaktif Fitur {APP_NAME}
        </h4>
        <p className="text-xs leading-relaxed text-emerald-100/90">
          Ulas lengkap detail manfaat praktis dan tata cara pengaplikasian dari seluruh modul & kalkulator fiqih di aplikasi kami. Klik baris judul untuk meluaskan panel akordeon, lalu gunakan tombol arah untuk membuka fiturnya secara langsung.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari fitur (misal: Zakat, Haid, Kitab)..."
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-600/50 dark:border-emerald-500/60 focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm outline-none text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            Batal
          </button>
        )}
      </div>

      {/* Accordions List */}
      <div className="space-y-3">
        {filteredFeatures.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-400">Panduan fitur tidak ditemukan. Coba ketik kata kunci lain.</p>
          </div>
        ) : (
          filteredFeatures.map((feature, idx) => {
            const isOpen = openSection === feature.id;
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-santri-green/50 dark:border-santri-gold/50 shadow-md ring-1 ring-santri-green/5' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleSection(feature.id)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${feature.color} text-white shrink-0 shadow-sm`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base leading-snug truncate">
                        {feature.title}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                        MODUL {idx + 1} • {isOpen ? 'Tutup Detail' : 'Ketuk untuk Detail'}
                      </p>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-all duration-300 shrink-0 ${isOpen ? 'rotate-180 text-santri-green dark:text-santri-gold bg-santri-green/10 dark:bg-santri-gold/10' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Accordion Content */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[1000px] border-t border-slate-50 dark:border-slate-800/50 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 md:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-950/20">
                    {/* Benefit Section */}
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-black text-santri-green dark:text-santri-gold uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle size={14} className="shrink-0" /> Manfaat & Kontribusi
                      </h5>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-left">
                        {feature.benefit}
                      </p>
                    </div>

                    {/* How to Use Section */}
                    <div className="space-y-2.5">
                      <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Play size={14} className="fill-current shrink-0" /> Cara Penggunaan Langkah demi Langkah
                      </h5>
                      <div className="space-y-2">
                        {feature.howToUse.map((step, sIdx) => (
                          <div key={sIdx} className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-slate-300/20 dark:border-slate-700/50">
                              {sIdx + 1}
                            </span>
                            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed pt-0.5">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation To Route Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => navigate(feature.path)}
                        className={`px-4.5 py-2.5 bg-gradient-to-r ${feature.color} text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer`}
                      >
                        <span>Mulai Gunakan Fitur</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

const INFO_CONTENT: Record<string, { title: string, icon: any, content: React.ReactNode }> = {
  about: {
    title: 'Tentang Aplikasi',
    icon: Info,
    content: (
      <div className="space-y-6 text-slate-600 dark:text-slate-300">
        <div className="flex flex-col items-center justify-center py-6">
           <div className="w-24 h-24 bg-gradient-to-br from-santri-green to-emerald-700 rounded-3xl flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl shadow-green-200 dark:shadow-green-900/30">
              S
           </div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{APP_NAME}</h2>
           <p className="text-sm text-santri-green dark:text-santri-gold font-semibold">Cerdas Tanpa Batas</p>
           <p className="text-xs text-slate-400 mt-1">Versi 1.0.0</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Cpu size={18} className="text-blue-500" /> Teknologi & Tradisi
          </h3>
          <p className="text-sm leading-relaxed text-justify">
            {APP_NAME} adalah ekosistem digital yang dirancang khusus for kaum santri dan pembelajar Muslim. Kami menggabungkan kekayaan khazanah <strong>Kitab Kuning (Turath)</strong> dengan kecanggihan <strong>Artificial Intelligence (AI)</strong>.
          </p>
        </div>

        <div className="space-y-3">
           <h3 className="font-bold text-slate-800 dark:text-slate-100">Fitur Unggulan:</h3>
           <ul className="space-y-2 text-sm">
              <li className="flex gap-3">
                <CheckCircle size={18} className="text-santri-green shrink-0 mt-0.5" />
                <span><strong>Bedah Kitab AI:</strong> Menerjemahkan makna gandul, analisis Nahwu Shorof, dan penjelasan kontekstual secara instan.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle size={18} className="text-santri-green shrink-0 mt-0.5" />
                <span><strong>Perpustakaan Digital:</strong> Akses ribuan referensi Al-Quran, Hadits, dan Kitab klasik dalam satu genggaman.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle size={18} className="text-santri-green shrink-0 mt-0.5" />
                <span><strong>Ibadah Harian:</strong> Jadwal Sholat akurat, Arah Kiblat, Tasbih Digital, hingga Kalkulator Zakat & Waris.</span>
              </li>
           </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-200 mt-4 leading-relaxed">
           <strong>Misi Kami:</strong> Menjaga sanad keilmuan <em>Ahlussunnah wal Jama'ah</em> sembari beradaptasi dengan kemajuan teknologi, memudahkan dakwah dan tholabul ilmi di era modern.
         </div>
      </div>
    )
  },
  guide: {
    title: 'Panduan Penggunaan',
    icon: BookOpen,
    content: <GuideAccordion />
  },
  terms: {
    title: 'Syarat & Ketentuan',
    icon: FileText,
    content: (
      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400">
        <p>Selamat datang di {APP_NAME}. Dengan mengakses atau menggunakan aplikasi ini, Anda setuju untuk terikat dengan ketentuan berikut:</p>
        
        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Penggunaan yang Diperbolehkan</h4>
           <p>Aplikasi ini ditujukan untuk tujuan pendidikan, dakwah, dan ibadah. Pengguna dilarang keras menggunakan konten atau fitur aplikasi untuk menyebarkan ujaran kebencian, paham radikal, atau konten yang bertentangan dengan hukum negara dan syariat Islam.</p>
        </div>

        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200">2. Hasil Generatif AI</h4>
           <p>Fitur penerjemah dan tanya-jawab menggunakan teknologi Artificial Intelligence. Meskipun kami berusaha menyajikan data yang akurat berdasarkan referensi Aswaja:</p>
           <ul className="list-disc pl-5 space-y-1">
              <li>AI mungkin sesekali menghasilkan interpretasi yang kurang tepat.</li>
              <li>Hasil analisis AI tidak boleh dianggap sebagai fatwa mutlak.</li>
              <li>Pengguna wajib memverifikasi hasil terjemahan dengan guru/ustadz yang kompeten untuk masalah hukum yang krusial.</li>
           </ul>
        </div>

        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200">3. Akun & Keamanan</h4>
           <p>Pengguna bertanggung jawab menjaga kerahasiaan akun mereka. Kami berhak memblokir akun yang terindikasi melakukan penyalahgunaan sistem atau pelanggaran etika.</p>
        </div>

        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200">4. Perubahan Layanan</h4>
           <p>Kami berhak memodifikasi, menangguhkan, atau menghentikan fitur tertentu sewaktu-waktu untuk pemeliharaan atau peningkatan layanan.</p>
        </div>
      </div>
    )
  },
  privacy: {
    title: 'Kebijakan Privasi',
    icon: Shield,
    content: (
      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
           Kami menghormati privasi Anda. Data Anda adalah amanah bagi kami.
        </div>

        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Data yang Kami Kumpulkan</h4>
           <ul className="list-disc pl-5 space-y-2">
              <li><strong>Informasi Akun:</strong> Nama, Email, dan Foto Profil (hanya jika Anda login via Google) untuk sinkronisasi data antar perangkat.</li>
              <li><strong>Aktivitas Pengguna:</strong> Riwayat terjemahan, penanda ayat, dan progres hafalan disimpan di server kami (Firebase/Supabase) agar Anda dapat mengaksesnya kembali.</li>
              <li><strong>Input Teks/Gambar:</strong> Teks atau gambar yang Anda kirimkan untuk diterjemahkan diproses oleh Google Gemini API dan tidak digunakan untuk melatih model AI publik secara langsung.</li>
           </ul>
        </div>

        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Izin Perangkat (Permissions)</h4>
           <div className="space-y-2">
              <p><strong>Lokasi (Location):</strong> Hanya digunakan untuk menghitung waktu sholat dan arah kiblat secara akurat sesuai posisi Anda saat itu. Data lokasi tidak dilacak secara background.</p>
              <p><strong>Kamera & Galeri:</strong> Digunakan untuk fitur pemindaian teks (OCR) dari buku/kitab. Gambar diproses sesaat dan tidak disimpan di galeri server kami.</p>
              <p><strong>Mikrofon:</strong> Digunakan untuk fitur Input Suara dan setoran hafalan Tahfidz.</p>
           </div>
        </div>

        <div className="space-y-3">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Keamanan Data</h4>
           <p>Kami menggunakan enkripsi standar industri untuk melindungi transmisi dan penyimpanan data Anda. Kami tidak menjual data pribadi Anda kepada pihak ketiga.</p>
        </div>
      </div>
    )
  },
  disclaimer: {
    title: 'Disclaimer (Penafian)',
    icon: AlertTriangle,
    content: (
      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400">
        <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex flex-col gap-3">
           <div className="flex items-center gap-2 font-bold text-lg">
              <AlertTriangle size={24} /> PERHATIAN PENTING
           </div>
           <p className="leading-relaxed">
             Aplikasi ini adalah <strong>alat bantu (wasilah)</strong>, bukan sumber hukum mutlak.
           </p>
        </div>

        <div className="space-y-4">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">1. Posisi AI dalam Ilmu Agama</h4>
           <p className="leading-relaxed text-justify">
             Kecerdasan Buatan (AI) dalam aplikasi ini dilatih dengan data kitab-kitab Islam, namun ia tidak memiliki "sanad" (mata rantai keilmuan) dan "dzauq" (rasa) layaknya seorang Ulama. AI bisa saja keliru dalam memahami konteks budaya, bahasa kiasan, atau hukum spesifik (kasuistik).
           </p>
        </div>

        <div className="space-y-4">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">2. Keharusan Bertalaqqi</h4>
           <p className="leading-relaxed text-justify">
             Ilmu agama, terutama yang berkaitan dengan Aqidah, Fiqih, dan Tasawuf, sejatinya harus diambil dari guru yang tersambung sanadnya (Talaqqi). Aplikasi ini berfungsi untuk <em>murojaah</em> (mengulang), mempercepat pencarian referensi, dan membantu pemahaman awal, namun <strong>tidak menggantikan peran Kyai, Ustadz, atau Guru Ngaji</strong>.
           </p>
        </div>

        <div className="space-y-4">
           <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">3. Tanggung Jawab Pengguna</h4>
           <p className="leading-relaxed text-justify">
             Pengembang tidak bertanggung jawab atas segala bentuk kerugian spiritual atau material yang timbul akibat kesalahan interpretasi pengguna terhadap konten yang disajikan. Selalu konsultasikan permasalahan agama yang kompleks kepada ahli Fiqih di lingkungan Anda.
           </p>
        </div>
      </div>
    )
  },
  contact: {
    title: 'Hubungi Kami',
    icon: Phone,
    content: (
      <div className="space-y-6">
        <div className="text-center py-6">
           <p className="text-slate-600 dark:text-slate-400 mb-2">
             Kami sangat menghargai masukan, kritik, dan saran Anda untuk pengembangan aplikasi ini.
           </p>
           <p className="text-xs text-slate-400">Jam Operasional Admin: Senin - Jumat, 09.00 - 17.00 WIB</p>
        </div>
        
        <div className="grid gap-4">
           <a href="mailto:support@santrimodern.com" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-green-500 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Mail size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-800 dark:text-slate-100">Email Support</h4>
                 <p className="text-sm text-slate-500">support@santrimodern.com</p>
              </div>
           </a>

           <a href="https://santriai.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-purple-500 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Globe size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-800 dark:text-slate-100">Website Resmi</h4>
                 <p className="text-sm text-slate-500">www.santrimodern.com</p>
              </div>
           </a>
        </div>
      </div>
    )
  }
};

const InfoScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const info = slug && INFO_CONTENT[slug] ? INFO_CONTENT[slug] : null;

  if (!info) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
            <p className="text-slate-500 mb-4">Halaman tidak ditemukan.</p>
            <button onClick={() => navigate(-1)} className="text-santri-green font-bold">Kembali</button>
        </div>
    );
  }

  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-md border-b border-emerald-700/40 px-4 py-3.5 flex items-center gap-3 transition-all">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-white hover:bg-white/15 active:scale-95 rounded-full transition-all cursor-pointer"
          title="Kembali"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-white/15 text-white backdrop-blur-xs">
            <Icon size={20} />
          </div>
          <h2 className="font-extrabold text-white text-base md:text-lg truncate">
            {info.title}
          </h2>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
         {slug !== 'about' && (
            <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-lg border border-slate-100 dark:border-slate-700">
                <Icon size={40} strokeWidth={1.5} />
                </div>
            </div>
         )}
         
         <div className="prose prose-sm md:prose-base max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
            {info.content}
         </div>
      </div>
    </div>
  );
};

export default InfoScreen;
