import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  User, 
  History, 
  Sparkles, 
  Scroll, 
  FileText,
  Bookmark,
  Compass,
  AlertCircle,
  Gem,
  Volume2,
  StopCircle,
  Share2,
  Copy,
  Check,
  Award,
  BookOpenCheck,
  Maximize2,
  Type,
  ChevronRight,
  Clock,
  Heart,
  HelpCircle,
  ChevronLeft,
  Star,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { generateJson } from '../services/geminiService';
import { fetchFromGitHub, fetchSimilarFromGitHub, saveToGitHub } from '../services/githubDataService';
import { deductWasilahForAI } from '../services/firebase';
import { useAudio } from '../contexts/AudioContext';
import { PLAYSTORE_LINK } from '../constants';
import { openExternalLink } from '../utils/linkUtils';
import CustomLoader from '../components/CustomLoader';
import { ContentReportModal } from '../components/ContentReportModal';

interface HistoryDetailData {
  id?: string;
  title: string;
  era: string;
  summary: string;
  background: string;
  chronology: string;
  figures: string;
  lessons: string;
  references: string;
}

const STATIC_HISTORY_DATA: Record<string, HistoryDetailData> = {
  'isra-miraj': {
    id: 'isra-miraj',
    title: "Isra Mi'raj Nabi Muhammad SAW",
    era: "Peristiwa Agung (27 Rajab)",
    summary: "Perjalanan luar biasa dalam semalam dari Masjidil Haram ke Masjidil Aqsa, lalu naik ke Sidratul Muntaha untuk menerima perintah ibadah shalat lima waktu langsung dari Allah SWT.",
    background: "Peristiwa agung ini terjadi pada periode akhir dakwah di Makkah (sekitar tahun ke-10 atau 11 kenabian), yang dikenal sebagai Amul Huzni (Tahun Kesedihan) setelah wafatnya Sayyidah Khadijah (istri tercinta) dan Abu Thalib (paman pelindung). Perjalanan suci ini diturunkan Allah sebagai penguatan batin, pembasuh duka, dan pembuktian mukjizat besar bagi kekasih-Nya.",
    chronology: "Perjalanan terbagi menjadi dua bagian:\n\n1) Isra: Rasulullah SAW dikendarai Buraq didampingi Malaikat Jibril AS melesat dari Makkah menuju Baitul Maqdis di Palestina. Di sana, beliau memimpin shalat berjamaah sebagai imam bagi ruh para Nabi terdahulu.\n\n2) Mi'raj: Kenaikan dari batu suci (Sakhrah) melintasi tujuh lapis langit. Pada setiap lapis langit, beliau disambut dengan hormat oleh para nabi (Adam, Isa, Yahya, Yusuf, Idris, Harun, Musa, dan Ibrahim AS) hingga melampaui Sidratul Muntaha dan menerima perintah shalat wajib 50 waktu yang akhirnya diringankan menjadi 5 waktu sehari semalam atas saran Nabi Musa AS.",
    figures: "• Nabi Muhammad SAW (Pembawa Risalah Utama)\n• Malaikat Jibril AS (Pendamping Perjalanan Suci)\n• Ruh Para Nabi Utusan Allah (Ma'mum Shalat di Al-Aqsa)\n• Sayyidina Abu Bakar Ash-Shiddiq (Shiddiqul Akbar yang membenarkan seketika)",
    lessons: "Penegasan kedudukan shalat sebagai tiang utama agama Islam dan satu-satunya ibadah fardhu yang perintahnya diterima langsung tanpa perantara malaikat; pembuktian kekuasaan mutlak Allah SWT yang melampaui batas dimensi ruang dan waktu; serta penyaringan keimanan sejati bagi para pengikut risalah tauhid.",
    references: "Sirah Nabawiyah Ibnu Hisyam, Hadits Riwayat Bukhari (No. 349) & Muslim (No. 162) bab al-Isran, serta Kitab Tafsir Ibnu Katsir Surah Al-Isra' ayat 1."
  },
  'maulid-nabi': {
    id: 'maulid-nabi',
    title: "Maulid Nabi Muhammad SAW",
    era: "Peristiwa Agung (12 Rabiul Awal)",
    summary: "Sejarah agung kelahiran manusia paling mulia yang diutus sebagai penutup para nabi, pelita akhlak mulia, dan perwujudan rahmat bagi sekalian alam semesta.",
    background: "Sebelum fajar kerasulan menyingsing, dunia berada dalam cengkeraman kegelapan jahiliyah. Penyembahan berhala merajalela, penindasan sosial tak terkendali, martabat kaum wanita diinjak-injak, dan moralitas umat manusia merosot tajam. Kelahiran Nabi Muhammad SAW adalah fajar penyelamat yang mengakhiri zaman kegelapan tersebut.",
    chronology: "Sayyidul Mursalin lahir pada hari Senin pagi, 12 Rabiul Awal Tahun Gajah (bertepatan dengan tanggal 20/22 April 571 Masehi). Tahun tersebut dinamakan Tahun Gajah karena bertepatan dengan digagalkannya serbuan tentara bergajah pimpinan Abrahah yang ingin menghancurkan Ka'bah oleh kawanan burung Ababil.\n\nIbunda beliau, Sayyidah Aminah, melahirkan tanpa merasakan sakit sama sekali, diiringi keajaiban pancaran cahaya yang menyinari istana-istana megah di Syam (Syria). Beliau terlahir dalam keadaan yatim karena sang ayah, Abdullah, telah wafat beberapa bulan sebelumnya di Madinah.",
    figures: "• Nabi Muhammad SAW (Sang Kekasih Allah)\n• Sayyidah Aminah (Ibunda Tercinta)\n• Sayyidina Abdullah (Ayahanda Mulia)\n• Abdul Muthalib (Kakek yang memberi nama Muhammad)\n• Halimah As-Sa'diyyah (Ibu asuh yang menyusui beliau di perkampungan Bani Sa'ad)",
    lessons: "Mengingatkan umat manusia untuk senantiasa bergembira dan bersyukur atas nikmat terbesar berupa diutusnya Rasulullah SAW; mengenalkan silsilah nasab beliau yang suci; serta menjadi momentum untuk meneladani kemuliaan karakter, kesucian batin, dan keagungan budi pekerti beliau sejak usia dini.",
    references: "Kitab Al-Wafa bi Ahwal al-Mustafa karya Al-Imam Ibnul Jauzi, Nurul Yaqin fi Sirat Sayyid al-Mursalin karya Syekh Muhammad al-Khudhri Bek."
  },
  'masa-rasulullah': {
    id: 'masa-rasulullah',
    title: "Era Perjuangan Rasulullah SAW",
    era: "Era Kenabian (0 - 11 H)",
    summary: "Sejarah perjuangan suci menegakkan tauhid selama 23 tahun yang mengubah peradaban gurun pasir menjadi peradaban cahaya, terbagi atas Fase Makkah dan Fase Madinah.",
    background: "Bermula di keheningan Gua Hira saat wahyu pertama (Surah Al-Alaq 1-5) diturunkan oleh malaikat Jibril kepada Nabi Muhammad yang berusia 40 tahun. Tugas berat ini menghendaki perubahan menyeluruh terhadap akidah penyembah berhala dan struktur sosial masyarakat Quraisy yang sangat keras.",
    chronology: "1) Fase Makkah (13 Tahun): Diawali dengan dakwah secara rahasia selama 3 tahun, kemudian dakwah terang-terangan. Menghadapi pemboikotan, siksaan fisik, dan intimidasi kejam. Puncaknya adalah keputusan untuk Hijrah demi menyelamatkan akidah.\n\n2) Fase Madinah (10 Tahun): Diawali penyambutan hangat kaum Anshor. Di sini dibangun fondasi negara Islam yang inklusif melalui Piagam Madinah, mempersaudarakan kaum Muhajirin & Anshor, serta pendirian Masjid Nabawi. Umat Islam terpaksa melakukan pertahanan militer dalam Perang Badar (17 Ramadhan 2 H), Perang Uhud, dan Perang Khandaq. Era ini diakhiri dengan peristiwa gemilang Fathu Makkah (Pembebasan Makkah) secara damai, pembersihan Ka'bah dari 360 berhala, dan Haji Wada' sebelum beliau wafat pada Rabiul Awal 11 H.",
    figures: "• Rasulullah Muhammad SAW (Pintu Hidayah Semesta)\n• Ummul Mukminin Khadijah binti Khuwailid (Istri & Penyokong Pertama)\n• Sayyidina Abu Bakar Ash-Shiddiq (Sahabat Karib & Teman Hijrah)\n• Sayyidina Umar bin Khattab (Singa Padang Pasir pembela dakwah)\n• Sayyidina Utsman bin Affan & Sayyidina Ali bin Abi Thalib",
    lessons: "Metodologi dakwah yang bijak dan bertahap; pentingnya membangun fondasi akidah (tauhid) yang kokoh sebelum menerapkan syariat hukum; urgensi persatuan sosial dan persaudaraan sesama mukmin; serta keteladanan tertinggi dalam kepemimpinan, diplomasi damai, dan sifat pemaaf bahkan kepada musuh yang kalah.",
    references: "Ar-Rahiq Al-Makhtum (Sirah Nabawiyah Terlengkap) karya Syekh Safiyurrahman al-Mubarakfuri, Sirah Ibnu Hisyam."
  },
  'khulafaur-rasyidin': {
    id: 'khulafaur-rasyidin',
    title: "Masa Khulafaur Rasyidin",
    era: "Khulafaur Rasyidin (11 - 41 H)",
    summary: "Zaman keemasan kepemimpinan para sahabat utama Rasulullah SAW yang menegakkan keadilan sosial, memperluas syiar Islam, dan menata dasar administrasi kekhalifahan berdasarkan syariat.",
    background: "Wafatnya Rasulullah SAW pada tahun 11 H membawa duka mendalam sekaligus ujian politik pertama bagi umat Islam. Melalui musyawarah mufakat yang ketat di Saqifah Bani Sa'idah, para sahabat bersepakat memilih pemimpin pembawa petunjuk untuk menjaga keutuhan umat.",
    chronology: "1) Abu Bakar Ash-Shiddiq (11-13 H): Menyelamatkan negara dari disintegrasi dengan menumpas nabi palsu dan kaum pembangkang zakat (Perang Riddah), serta menginisiasi pengumpulan lembaran Al-Quran.\n\n2) Umar bin Khattab (13-23 H): Memelopori ekspansi besar-besaran (bebasnya Syam, Mesir, dan runtuhnya imperium Persia), merumuskan kalender Hijriah, mendirikan kas negara (Baitul Maal), dan membentuk lembaga peradilan.\n\n3) Utsman bin Affan (23-35 H): Menyusun standarisasi Mushaf Al-Quran (Mushaf Usmani) yang menyelamatkan umat dari perpecahan bacaan, membangun armada angkatan laut Islam pertama, dan memperluas Masjidil Haram.\n\n4) Ali bin Abi Thalib (35-41 H): Menghadapi pergolakan politik internal pasca-syahidnya Utsman, memindahkan ibukota kekhalifahan ke Kufah (Irak), dan berfokus pada penataan aparatur negara yang bersih.",
    figures: "• Sayyidina Abu Bakar Ash-Shiddiq (Penyelamat Keutuhan Negara)\n• Sayyidina Umar bin Khattab (Al-Faruq, Sang Pembaharu Administrasi)\n• Sayyidina Utsman bin Affan (Dzun Nurain, Sang Penyusun Mushaf Tunggal)\n• Sayyidina Ali bin Abi Thalib (Babun Nikmah, Sang Penegak Keadilan)\n• Zaid bin Tsabit (Ketua Tim Kodifikasi Al-Quran)",
    lessons: "Prinsip musyawarah (Syura) dalam menentukan kemaslahatan publik; integritas moral dan kesederhanaan ekstrem dari para pemimpin tertinggi dunia; supremasi hukum yang setara bagi semua golongan; serta loyalitas total demi kejayaan syiar Islam.",
    references: "Tarikh al-Khulafa karya Al-Imam Jalaluddin As-Suyuthi, Al-Bidayah wan Nihayah karya Al-Hafiz Ibnu Katsir."
  },
  'keemasan-islam': {
    id: 'keemasan-islam',
    title: "Zaman Keemasan Peradaban Islam",
    era: "Abad Pertengahan (7 - 13 M)",
    summary: "Era gemilang di mana dunia Islam memimpin peradaban global dalam bidang sains, filsafat, kedokteran, matematika, dan astronomi, menjembatani ilmu pengetahuan kuno menuju era modern.",
    background: "Etos keilmuan yang didorong oleh perintah Al-Quran untuk membaca dan memikirkan alam semesta berpadu dengan kemakmuran ekonomi kekhalifahan. Para khalifah menginvestasikan kekayaan negara secara besar-besaran untuk membiayai penerjemahan, penelitian ilmiah, dan pendirian perpustakaan universal.",
    chronology: "Pusat pergerakan intelektual ini berporos di Baitul Hikmah (Rumah Kearifan) di Baghdad di bawah Kekhalifahan Abbasiyah (terutama masa Harun Ar-Rasyid dan Al-Ma'mun). Jutaan buku dari peradaban Yunani, India, dan Persia diterjemahkan dan dikembangkan secara eksperimental.\n\nDi belahan barat, Cordoba dan Granada di bawah Daulah Umayyah II Andalusia menjadi mercusuar sains yang menerangi benua Eropa yang saat itu berada dalam kegelapan (Dark Ages). Dari universitas dan laboratorium muslim inilah lahir cikal bakal metode ilmiah modern.",
    figures: "• Al-Khwarizmi (Bapak Aljabar & Penemu Algoritma)\n• Ibnu Sina (Avicenna, Peletak Dasar Kedokteran Modern)\n• Al-Zahrawi (Bapak Ilmu Bedah Modern)\n• Jabir bin Hayyan (Geber, Bapak Ilmu Kimia Eksperimental)\n• Ibnu Rusyd (Averroes, Filsuf & Ahli Hukum Islam Terkemuka)",
    lessons: "Membuktikan secara empiris bahwa Islam sangat mendukung perkembangan ilmu pengetahuan; keimanan yang kokoh tidak menghalangi kemajuan intelektual; melainkan justru mendorong manusia untuk meneliti rahasia penciptaan Allah demi kemaslahatan kemanusiaan.",
    references: "Tarikh al-Hadharah al-Islamiyyah karya Dr. Jamil Abdullah, The History of the Islamic Golden Age."
  },
  'wali-songo': {
    id: 'wali-songo',
    title: "Dakwah Damai Wali Songo di Nusantara",
    era: "Wali Songo (Abad 14 - 16 M)",
    summary: "Sejarah emas islamisasi damai di kepulauan Nusantara, memadukan nilai-nilai murni tauhid dengan kesenian, adat istiadat, dan kearifan budaya lokal Jawa.",
    background: "Sebelum kedatangan para wali, masyarakat Nusantara berada di bawah pengaruh kuat kerajaan Hindu-Buddha dengan kasta sosial yang ketat serta penganut animisme yang kental. Dakwah para wali dituntut mampu menyentuh hati rakyat tanpa menimbulkan konflik sosial atau benturan budaya.",
    chronology: "Sembilan wali Allah (Wali Songo) mengorganisasikan gerakan dakwah secara sistematis di sepanjang pantai utara Jawa. Mereka tidak menggunakan kekuatan militer atau paksaan, melainkan asimilasi damai melalui:\n\n1) Perdagangan dan perkawinan strategis.\n2) Pendidikan berbasis Pesantren untuk mencetak kader ulama lokal.\n3) Kesenian rakyat yang disisipi ajaran tauhid. Sunan Kalijaga mengadaptasi pertunjukan Wayang Kulit dengan mengubah lakon Hindu menjadi bernafaskan Islam (seperti Kalimasada). Sunan Bonang menciptakan tembang suluk rohani dan gamelan Bonang. Sunan Kudus menghormati penganut Hindu dengan melarang penyembelihan sapi di wilayahnya, menggantinya dengan kerbau.",
    figures: "• Sunan Gresik (Maulana Malik Ibrahim, Sesepuh Da'i Nusantara)\n• Sunan Ampel (Perancang Kerajaan Demak & Pesantren Ampeldenta)\n• Sunan Bonang & Sunan Drajat (Putra Sunan Ampel, Ahli Seni Suluk)\n• Sunan Kalijaga (Sastrawan & Maestro Wayang Kulit Dakwah)\n• Sunan Kudus & Sunan Muria (Pakar Fikih & Toleransi Budaya)",
    lessons: "Implementasi dakwah yang ramah, santun, dan menyejukkan (dakwah bil hikmah); keluwesan kultural yang tetap menjaga kemurnian akidah; pentingnya memahami latar belakang sosiologis masyarakat; serta teladan toleransi beragama yang tinggi.",
    references: "Atlas Walisongo karya KH. Ng. Agus Sunyoto, Babad Tanah Jawi, Serat Centhini."
  },
  'era-modern': {
    id: 'era-modern',
    title: "Kebangkitan Islam & Pemikiran Modern",
    era: "Era Modern (Abad 19 - Sekarang)",
    summary: "Sejarah perjuangan para ulama dan ormas Islam di Indonesia dalam melawan penjajahan, mendirikan sistem pendidikan modern, serta merumuskan konsep keselarasan antara Islam dan Nasionalisme.",
    background: "Penjajahan kolonial Belanda yang menindas bangsa Indonesia dan membiarkan keterbelakangan pendidikan memicu keprihatinan mendalam para ulama Nusantara yang belajar di Makkah. Sekembalinya ke tanah air, mereka memelopori gerakan kebangkitan umat berbasis organisasi kemasyarakatan.",
    chronology: "Para kiai menjadikan pondok pesantren sebagai pusat perlawanan fisik dan perang gerilya sekaligus benteng pertahanan pemikiran Aswaja. \n\nKH Ahmad Dahlan mendirikan Muhammadiyah pada tahun 1912 dengan fokus purifikasi akidah serta pembaruan sistem sekolah modern, panti asuhan, dan rumah sakit. \n\nHadratusyaikh KH Hasyim Asy'ari mendirikan Nahdlatul Ulama (NU) pada tahun 1926 untuk melestarikan tradisi mazhab, merawat keluhuran akhlak pesantren, dan membela keutuhan bangsa. Pada masa kemerdekaan, para ulama menyepakati Pancasila dan UUD 1945 sebagai mufakat luhur bangsa, serta mengeluarkan Resolusi Jihad (22 Oktober 1945) yang mewajibkan umat Islam mempertahankan kemerdekaan Indonesia.",
    figures: "• Hadratusyaikh KH Hasyim Asy'ari (Mahaguru & Pendiri Nahdlatul Ulama)\n• KH Ahmad Dahlan (Pemberontak Kebodohan & Pendiri Muhammadiyah)\n• KH Wahid Hasyim (Menteri Agama RI Pertama & Perumus Dasar Negara)\n• Buya Hamka (Sastrawan, Sejarahwan & Penulis Tafsir Al-Azhar)",
    lessons: "Bahwa kecintaan kepada tanah air merupakan bagian tak terpisahkan dari keimanan (Hubbul Wathan minal Iman); pentingnya berorganisasi secara tertib dan modern; serta keselarasan harmonis antara identitas keislaman dan identitas kebangsaan Indonesia.",
    references: "Sejarah Resolusi Jihad NU karya KH. Agus Sunyoto, Buku Biografi Tokoh Pembaru Islam Indonesia, serta Dokumentasi Perjuangan BPUPKI."
  }
};

const ALL_RECOMMENDATIONS = [
  {
    title: "Kisah Nabi Adam AS",
    desc: "Awal penciptaan manusia pertama dan teladan taubat.",
    query: "Kisah lengkap Nabi Adam AS sejak diciptakan, godaan iblis di surga, diturunkannya ke bumi, hingga taubatnya secara detail sesuai Al-Quran"
  },
  {
    title: "Kisah Nabi Yusuf AS",
    desc: "Teladan kesabaran menghadapi ujian fitnah dan kejayaan Mesir.",
    query: "Kisah lengkap Nabi Yusuf AS, ketampanan batin dan fisiknya, fitnah Zulaikha, kesabaran dalam penjara, mukjizat takwil mimpi, hingga kejayaannya menjadi bendaharawan Mesir berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama'ah."
  },
  {
    title: "Kisah Sunan Kalijaga",
    desc: "Metode dakwah kultural penuh kelembutan lewat kesenian wayang.",
    query: "Sejarah perjuangan dakwah Sunan Kalijaga (Raden Said), metode dakwah wayang kulit, suluk kidung, dan falsafah hidupnya yang mendalam"
  },
  {
    title: "Perang Badar Kubra",
    desc: "Pertempuran pertahanan iman dan pertolongan malaikat dari langit.",
    query: "Kronologi lengkap Perang Badar Kubra, strategi militer Rasulullah, bantuan ribuan malaikat dari langit, serta hikmah kemenangan besar ini"
  },
  {
    title: "Kisah Umar bin Khattab",
    desc: "Ketegasan penegakan keadilan dan kesederhanaan khalifah.",
    query: "Kisah lengkap Khalifah Umar bin Khattab (Al-Faruq), keadilan kepemimpinannya yang ditakuti setan, perluasan wilayah, dan kesederhanaannya"
  }
];

const CLASSIC_REFS = [
  {
    name: "Kitab Al-Bidayah wan Nihayah",
    author: "Al-Hafiz Ibnu Katsir",
    desc: "Kitab induk sejarah penciptaan hingga akhir zaman.",
    query: "Uraikan sejarah penulisan, profil pengarang Al-Hafiz Ibnu Katsir, dan kandungan Kitab Al-Bidayah wan Nihayah secara lengkap berdasarkan Aswaja"
  },
  {
    name: "Kitab Sirah Nabawiyah",
    author: "Ibnu Hisyam",
    desc: "Rujukan terlengkap perjalanan hidup Rasulullah SAW.",
    query: "Uraikan sejarah penulisan, profil pengarang Ibnu Hisyam, dan kandungan Kitab Sirah Nabawiyah Ibnu Hisyam secara lengkap berdasarkan Aswaja"
  },
  {
    name: "Kitab Tarikh al-Thabari",
    author: "Imam Abu Ja'far At-Thabari",
    desc: "Kitab tarikh monumental rujukan sejarawan dunia.",
    query: "Uraikan sejarah penulisan, profil pengarang Imam Abu Ja'far At-Thabari, dan kandungan Kitab Tarikh At-Thabari secara lengkap berdasarkan Aswaja"
  },
  {
    name: "Kitab Tarikh al-Khulafa",
    author: "Imam Jalaluddin As-Suyuthi",
    desc: "Sejarah para pemimpin umat islam pasca wafatnya nabi.",
    query: "Uraikan sejarah penulisan, profil pengarang Imam Jalaluddin As-Suyuthi, dan kandungan Kitab Tarikh al-Khulafa secara lengkap berdasarkan Aswaja"
  },
  {
    name: "Atlas Walisongo",
    author: "KH. Ng. Agus Sunyoto",
    desc: "Kajian ilmiah penyebaran islam damai di Nusantara.",
    query: "Uraikan sejarah penulisan, profil pengarang KH Ng Agus Sunyoto, dan kandungan buku Atlas Walisongo secara lengkap berdasarkan Aswaja"
  }
];

const IslamicHistoryDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();
  const { isPlaying, currentTtsInfo, speakTts } = useAudio();

  const { id: stateId, query: stateQuery } = (location.state as { id?: string; query?: string }) || {};

  const [data, setData] = useState<HistoryDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoWasilah, setHasNoWasilah] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isGeneratingRef = useRef(false);

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(14); // default 14px text-xs/sm
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scrolling for progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const activeId = stateId || (stateQuery ? Object.keys(STATIC_HISTORY_DATA).find(k => 
      STATIC_HISTORY_DATA[k].title.toLowerCase().includes(stateQuery.toLowerCase()) ||
      k.toLowerCase().includes(stateQuery.toLowerCase()) ||
      stateQuery.toLowerCase().includes(STATIC_HISTORY_DATA[k].title.toLowerCase())
    ) : undefined);

    if (activeId && STATIC_HISTORY_DATA[activeId]) {
      setData(STATIC_HISTORY_DATA[activeId]);
      setLoading(false);
    } else if (stateQuery) {
      fetchAiHistory(stateQuery);
    } else {
      showToast("Data sejarah tidak ditemukan.", "error");
      navigate('/islamic-history');
    }
  }, [stateId, stateQuery]);

  const fetchAiHistory = async (queryText: string) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setLoading(true);

    const cleanTopic = queryText
      .replace(/^Kisah dan sejarah lengkap tentang /i, '')
      .replace(/ beserta tokoh, alur kronologi, dan hikmahnya secara mendalam\.?/i, '')
      .trim();

    // 1. Cek basis data GitHub terlebih dahulu sebelum memanggil AI
    try {
      let githubMatch = await fetchFromGitHub('history', cleanTopic) 
        || await fetchFromGitHub('history', queryText)
        || await fetchSimilarFromGitHub('history', cleanTopic)
        || await fetchSimilarFromGitHub('history', queryText)
        || await fetchFromGitHub('sejarah', cleanTopic)
        || await fetchSimilarFromGitHub('sejarah', cleanTopic);

      if (githubMatch && (githubMatch.title || githubMatch.chronology)) {
        setData({
          title: githubMatch.title || cleanTopic,
          era: githubMatch.era || "Sejarah Islam",
          summary: githubMatch.summary || "Rangkuman kajian sejarah.",
          background: githubMatch.background || "Latar belakang kisah sejarah.",
          chronology: githubMatch.chronology || "",
          figures: githubMatch.figures || "Tokoh-tokoh terkait.",
          lessons: githubMatch.lessons || "Hikmah peristiwa.",
          references: githubMatch.references || "Referensi sejarah klasik."
        });
        showToast("Berhasil memuat kajian sejarah dari basis data!", "success");
        setLoading(false);
        isGeneratingRef.current = false;
        return;
      }
    } catch (ghErr) {
      console.warn("[GitHub History Check Error]", ghErr);
    }

    // 2. Jika tidak ada di GitHub, cek akun dan Wasilah user untuk memanggil AI
    if (authLoading) {
      setLoading(false);
      isGeneratingRef.current = false;
      return;
    }

    if (!user) {
      showToast("Tanya Sejarah AI memerlukan login.", "info");
      navigate('/settings');
      setLoading(false);
      isGeneratingRef.current = false;
      return;
    }

    if (!userData) {
      setTimeout(() => {
        isGeneratingRef.current = false;
        fetchAiHistory(queryText);
      }, 1000);
      return;
    }

    if ((userData?.wasilah || 0) < 1) {
      setHasNoWasilah(true);
      setLoading(false);
      isGeneratingRef.current = false;
      return;
    }

    setHasNoWasilah(false);

    const prompt = `
      Bertindaklah sebagai Pakar Sejarah Islam, Sirah Nabawiyah, dan Sejarawan Muslim yang sangat mendalam pengetahuannya.
      Analisis peristiwa/tokoh sejarah berikut: "${cleanTopic}"
      
      Sajikan jawaban dalam format JSON valid dengan struktur berikut:
      {
        "title": "Nama Peristiwa / Tokoh Sejarah Lengkap",
        "era": "Keterangan Era/Abad Peristiwa (misal: Masa Kenabian / Khulafaur Rasyidin / Abad Pertengahan)",
        "summary": "Ringkasan peristiwa/tokoh dalam 2-3 kalimat padat.",
        "background": "Latar belakang terjadinya peristiwa atau asal-usul tokoh secara mendalam (minimal 1 paragraf panjang).",
        "chronology": "Kronologi kejadian secara runut atau rincian perjuangan tokoh secara komprehensif (minimal 2 paragraf panjang).",
        "figures": "Tokoh-tokoh utama yang terlibat beserta peran singkatnya masing-masing.",
        "lessons": "Hikmah, pelajaran penting, keteladanan akhlak, atau dampak sejarah bagi peradaban hari ini (minimal 1 paragraf panjang).",
        "references": "Referensi kitab-kitab sejarah klasik yang muktabar (seperti Tarikh Thabari, Sirah Ibnu Hisyam, Al-Bidayah wan Nihayah, dll) yang memuat kisah ini."
      }
    `;

    try {
      const parsed = await generateJson(prompt, "Pakar Sejarah Islam dan Sirah Nabawiyah.");
      await deductWasilahForAI(user.uid, 1, `Cari Sejarah - ${cleanTopic}`);
      showToast("Berhasil memuat kajian sejarah! (Dipotong 1 Wasilah)", "success");

      const formattedData: HistoryDetailData = {
        title: parsed.title || cleanTopic,
        era: parsed.era || "Sejarah Islam",
        summary: parsed.summary || "Rangkuman kajian sejarah.",
        background: parsed.background || "Latar belakang kisah sejarah.",
        chronology: parsed.chronology || "",
        figures: parsed.figures || "Tokoh-tokoh terkait.",
        lessons: parsed.lessons || "Hikmah peristiwa.",
        references: parsed.references || "Referensi sejarah klasik."
      };

      setData(formattedData);

      // Simpan data ke GitHub secara otomatis agar query berikutnya dapat diambil secara konsisten tanpa biaya AI
      try {
        saveToGitHub('history', cleanTopic, formattedData);
      } catch (saveErr) {
        console.warn("[Save History to GitHub Failed]", saveErr);
      }
    } catch (e) {
      console.error(e);
      showToast("Gagal memproses sejarah via AI, menampilkan teks mentah.", "info");
      setData({
        title: cleanTopic,
        era: "Pencarian AI",
        summary: "Kajian sejarah hasil pencarian AI.",
        background: "Penjelasan lengkap dapat dibaca pada kolom kronologi di bawah.",
        chronology: "Terjadi gangguan saat memilah struktur kajian sejarah. Berikut penjelasan lengkapnya:\n\n" + (e instanceof Error ? e.message : "Kesalahan sistem."),
        figures: "Nabi Muhammad SAW dan Para Sahabat.",
        lessons: "Mengambil keteguhan iman dan perjuangan dakwah dari kisah ini.",
        references: "Kitab-kitab Sirah Nabawiyah klasik."
      });
    } finally {
      setLoading(false);
      isGeneratingRef.current = false;
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = `*${data.title}*\n[${data.era}]\n\n*RINGKASAN:*\n${data.summary}\n\n*LATAR BELAKANG:*\n${data.background}\n\n*KRONOLOGI:*\n${data.chronology}\n\n*TOKOH UTAMA:*\n${data.figures}\n\n*HIKMAH & PELAJARAN:*\n${data.lessons}\n\n*REFERENSI:*\n${data.references}\n\nDisalin dari Aplikasi Santri AI.\n${PLAYSTORE_LINK}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("Kajian sejarah berhasil disalin!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!data) return;
    const shareText = `*${data.title}*\n[${data.era}]\n\n${data.summary}\n\nPelajari sejarah islam selengkapnya di aplikasi Santri AI.\n${PLAYSTORE_LINK}`;
    const title = data.title;
    
    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, shareText);
      } catch (err) {
        handleCopy();
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSpeak = () => {
    if (!data) return;
    const textToSpeak = `${data.title}. Era: ${data.era}. Ringkasan: ${data.summary}. Latar belakang: ${data.background}. Kronologi: ${data.chronology}. Hikmah: ${data.lessons}`;
    speakTts(textToSpeak, false, data.title, data.id || 'ai-history-detail');
  };

  // Helper to calculate reading time
  const getReadingTime = () => {
    if (!data) return 3;
    const words = `${data.background} ${data.chronology} ${data.lessons}`.split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 150)); // ~150 words per minute for study reading
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-slate-50 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-6">
        <CustomLoader />
        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-6 animate-pulse text-center">
          Membuka Manuskrip Sejarah Islam...
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center max-w-xs">
          Mengumpulkan riwayat sahih dari catatan sejarah ulama klasik
        </p>
      </div>
    );
  }

  if (hasNoWasilah) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-100 dark:border-red-900/40">
          <AlertCircle size={30} />
        </div>
        <h3 className="font-black text-slate-800 dark:text-white text-lg mb-2 text-center">Wasilah Tidak Cukup</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs text-center max-w-sm mb-6 leading-relaxed">
          Kajian sejarah khusus ini memerlukan 1 Wasilah untuk memproses analisis pakar sejarah AI. Wasilah Anda saat ini adalah 0.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/premium')} 
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
          >
            <Gem size={12} className="animate-pulse" /> Top Up Wasilah
          </button>
          <button 
            onClick={() => navigate('/islamic-history')} 
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black active:scale-95 transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-slate-950 pb-24 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-900 z-[100]">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header Sticky */}
      <div className="bg-[#005a2b] dark:bg-slate-900 pt-5 pb-4 px-4 rounded-b-[2rem] shadow-lg sticky top-0 z-50 transition-colors border-b border-white/5">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <button 
              onClick={() => navigate('/islamic-history')} 
              className="p-2.5 bg-white/10 hover:bg-white/15 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-white active:scale-90 transition-all flex-shrink-0 border border-white/5"
            >
              <ArrowLeft size={18}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-xs md:text-sm font-black text-white leading-tight truncate">Detail Manuskrip Sejarah</h1>
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-300 truncate flex items-center gap-1 mt-0.5">
                <Clock size={9} /> {getReadingTime()} Menit Membaca
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleSpeak}
              className={`p-2.5 rounded-2xl text-white border border-white/5 transition-all active:scale-90 ${isPlaying && currentTtsInfo?.id === (data?.id || 'ai-history-detail') ? 'bg-amber-500 text-white scale-105' : 'bg-white/10 hover:bg-white/15'}`}
              title="Dengarkan Audio Sejarah"
            >
              {isPlaying && currentTtsInfo?.id === (data?.id || 'ai-history-detail') ? <StopCircle size={16} className="animate-pulse" /> : <Volume2 size={16} />}
            </button>
            <button 
              onClick={handleShare}
              className="p-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-white active:scale-90 transition-all border border-white/5"
              title="Bagikan Sejarah"
            >
              <Share2 size={16} />
            </button>
            <button 
              onClick={handleCopy}
              className="p-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-white active:scale-90 transition-all border border-white/5"
              title="Salin Teks"
            >
              {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
            </button>
            <button 
              onClick={() => openExternalLink(PLAYSTORE_LINK)}
              className="p-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-2xl active:scale-90 transition-all border border-amber-400/30"
              title="Beri Rating di Play Store"
            >
              <Star size={16} className="fill-amber-300" />
            </button>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl active:scale-90 transition-all border border-rose-400/30"
              title="Laporkan Masalah / Koreksi ke Admin"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 max-w-2xl mx-auto space-y-6">
        {/* Editorial Title Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800 shadow-md relative overflow-hidden text-center"
        >
          {/* Subtle watermark geometric background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L40 20 L60 30 L40 40 L30 60 L20 40 L0 30 L20 20 Z' fill='none' stroke='%23000000' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
          }}></div>

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 mb-4 inline-block">
              {data?.era}
            </span>
            <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white max-w-lg mb-4 font-serif">
              {data?.title}
            </h2>
            
            {/* Elegant separation line */}
            <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full mb-4"></div>

            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl italic font-medium">
              "{data?.summary}"
            </p>
          </div>
        </motion.div>

        {/* Reader Settings Bar (Font Size Adjuster) */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
            <Type size={14} className="text-emerald-600" /> Pengaturan Ukuran Teks
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
              className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-black rounded-lg transition-colors active:scale-90"
              title="Perkecil Tulisan"
            >
              A-
            </button>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 w-8 text-center">
              {fontSize}px
            </span>
            <button 
              onClick={() => setFontSize(prev => Math.min(20, prev + 1))}
              className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-black rounded-lg transition-colors active:scale-90"
              title="Perbesar Tulisan"
            >
              A+
            </button>
          </div>
        </div>

        {/* Elegant Unified Reader Paper Layout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-[#ebd9be]/40 dark:border-slate-800/60 shadow-md p-6 md:p-8 relative space-y-8"
        >
          {/* Section 1: Latar Belakang Peristiwa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#8c672b] dark:text-amber-400 flex items-center gap-2">
                <Scroll size={15} /> 1. Latar Belakang Peristiwa
              </h3>
            </div>
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              className="text-slate-700 dark:text-slate-200 leading-relaxed text-justify whitespace-pre-line font-medium font-serif"
            >
              {data?.background && (
                <>
                  <span className="float-left text-3xl md:text-4xl font-serif font-black text-emerald-700 dark:text-emerald-400 mr-2.5 mt-1 border-b-2 border-amber-500/30 leading-none">
                    {data.background.charAt(0)}
                  </span>
                  {data.background.slice(1)}
                </>
              )}
            </div>
          </div>

          {/* Separator Accent */}
          <div className="py-2 flex items-center justify-center gap-4">
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
            <Compass size={14} className="text-slate-300 dark:text-slate-600" />
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
          </div>

          {/* Section 2: Alur Kronologi & Kisah Lengkap */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <History size={15} /> 2. Alur Kronologi & Kisah Lengkap
              </h3>
            </div>
            <p 
              style={{ fontSize: `${fontSize}px` }} 
              className="text-slate-700 dark:text-slate-200 leading-relaxed text-justify whitespace-pre-line font-medium font-serif bg-slate-50/60 dark:bg-slate-950/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-850/50 shadow-inner"
            >
              {data?.chronology}
            </p>
          </div>

          {/* Separator Accent */}
          <div className="py-2 flex items-center justify-center gap-4">
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
            <Compass size={14} className="text-slate-300 dark:text-slate-600" />
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
          </div>

          {/* Section 3: Tokoh Sejarah Utama */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-full"></span>
              <h3 className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 flex items-center gap-2">
                <User size={15} /> 3. Tokoh Sejarah Utama
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Tokoh-tokoh penting yang memiliki peranan sentral dalam peristiwa bersejarah ini:
            </p>
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              className="grid grid-cols-1 gap-3"
            >
              {data?.figures.split('\n').map((bullet, index) => {
                if (bullet.trim()) {
                  return (
                    <div key={index} className="p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-950/40 border border-amber-500/10 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5 shadow-sm"></span>
                      <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-serif">{bullet.replace(/^•\s*/, '')}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Separator Accent */}
          <div className="py-2 flex items-center justify-center gap-4">
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
            <Compass size={14} className="text-slate-300 dark:text-slate-600" />
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1"></div>
          </div>

          {/* Section 4: Hikmah & Pelajaran Peradaban */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Award size={15} /> 4. Hikmah & Pelajaran Peradaban
              </h3>
            </div>
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              className="text-slate-700 dark:text-slate-200 leading-relaxed text-justify whitespace-pre-line font-medium font-serif bg-emerald-500/5 dark:bg-emerald-950/10 p-5 rounded-3xl border border-emerald-500/10"
            >
              {data?.lessons}
            </div>
          </div>

          {/* Section 5: Rujukan Manuskrip & Kitab Klasik */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <BookOpen size={13} /> Rujukan Manuskrip & Kitab Klasik
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed italic whitespace-pre-line font-serif">
                {data?.references}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Clickable Recommendations & References to Deepen History */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#8c672b] dark:text-amber-400 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500 animate-pulse" /> Rekomendasi Kisah Sejarah Lainnya
            </h3>
            <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
              Kajian Pilihan
            </span>
          </div>

          {/* Grid of Recommended Stories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ALL_RECOMMENDATIONS
              .filter(rec => rec.title.toLowerCase() !== data?.title.toLowerCase())
              .slice(0, 4)
              .map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/islamic-history-detail', { state: { query: item.query } });
                  }}
                  className="group p-5 bg-white dark:bg-slate-900 rounded-[2.2rem] border border-[#ebd9be]/50 dark:border-slate-800 hover:border-amber-500/50 hover:bg-[#faf6ed] dark:hover:bg-slate-850 text-left transition-all duration-300 active:scale-[0.98] flex flex-col justify-between min-h-[130px] relative overflow-hidden shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Kisah Pilihan
                      </span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-xs font-serif leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
          </div>

          {/* Deepen References Section - Clickable Classical Books */}
          <div className="space-y-4 pt-4 border-t border-[#ebd9be]/40 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#8c672b] dark:text-amber-400 flex items-center gap-2">
              <BookOpenCheck size={14} /> Kitab Klasik & Sumber Rujukan (Klik untuk Memperdalam)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dapatkan ulasan mendalam, biografi pengarang, metode penulisan, dan keaslian riwayat dari kitab-kitab tarikh mu'tabar Ahlussunnah wal Jama'ah berikut langsung dari AI:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CLASSIC_REFS.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/islamic-history-detail', { state: { query: ref.query } });
                  }}
                  className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-amber-500/50 hover:bg-[#faf6ed] dark:hover:bg-slate-850 text-left transition-all duration-300 active:scale-[0.97] flex items-start gap-3.5 shadow-sm"
                >
                  <div className="p-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <BookOpen size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h6 className="font-bold text-slate-850 dark:text-white text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {ref.name}
                    </h6>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      Karya: {ref.author}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {ref.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Bottom Pagination/Navigation */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/20">
          <button 
            onClick={() => navigate('/islamic-history')} 
            className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
          >
            <ChevronLeft size={16} strokeWidth={2.5} /> Kembali Ke Garis Waktu
          </button>
        </div>
      </div>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName={`Sejarah Islam - ${data?.title || 'Kajian'}`}
        contentSnippet={data?.title ? `${data.title} (${data.era})\n\n${data.summary}\n\n${data.background}` : ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default IslamicHistoryDetailScreen;
