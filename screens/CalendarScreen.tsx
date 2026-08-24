import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, MapPin, Hourglass, Star, ChevronDown, X, BookOpen, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePrayer } from '../contexts/PrayerContext';
import { UserAvatar } from '../components/UserAvatar';

// --- HELPER CONSTANTS & FUNCTIONS ---

const DAYS_ID = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Indonesian Hijri Mapping
const HIJRI_MONTHS_ID: Record<string, string> = {
  "Muharram": "Muharram",
  "Safar": "Safar",
  "Rabi' al-Awwal": "Rabiul Awal",
  "Rabi' al-Thani": "Rabiul Akhir",
  "Jumada al-Ula": "Jumadil Awal",
  "Jumada al-Akhirah": "Jumadil Akhir",
  "Rajab": "Rajab",
  "Sha'ban": "Sya'ban",
  "Ramadan": "Ramadhan",
  "Shawwal": "Syawal",
  "Dhu al-Qi'dah": "Dzulkaidah",
  "Dhu al-Hijjah": "Dzulhijjah",
  "Dhul Qidah": "Dzulkaidah",
  "Dhul Hijjah": "Dzulhijjah",
  "Rabiʻ I": "Rabiul Awal",
  "Rabiʻ II": "Rabiul Akhir",
};

// Major Islamic Events (Hijri Month/Day) based on common Kemenag standards
const ISLAMIC_EVENTS = [
  { name: 'Tahun Baru Hijriyah', month: 1, day: 1, isHoliday: true },
  { name: 'Hari Tasu\'a (9 Muharram)', month: 1, day: 9, isHoliday: false },
  { name: 'Hari Asyura (10 Muharram)', month: 1, day: 10, isHoliday: true },
  { name: 'Maulid Nabi SAW', month: 3, day: 12, isHoliday: true },
  { name: 'Pembebasan Khaybar (10 Rajab)', month: 7, day: 10, isHoliday: false },
  { name: 'Isra Mi\'raj', month: 7, day: 27, isHoliday: true },
  { name: 'Nisfu Syakban (15 Sya\'ban)', month: 8, day: 15, isHoliday: false },
  { name: 'Awal Ramadhan', month: 9, day: 1, isHoliday: false },
  { name: 'Nuzulul Qur\'an', month: 9, day: 17, isHoliday: false },
  { name: 'Idul Fitri 1 Syawal', month: 10, day: 1, isHoliday: true },
  { name: 'Idul Fitri 2 Syawal', month: 10, day: 2, isHoliday: true },
  { name: 'Hari Arafah (9 Dzulhijjah)', month: 12, day: 9, isHoliday: false },
  { name: 'Idul Adha', month: 12, day: 10, isHoliday: true },
  { name: 'Hari Tasyrik 1', month: 12, day: 11, isHoliday: false },
  { name: 'Hari Tasyrik 2', month: 12, day: 12, isHoliday: false },
  { name: 'Hari Tasyrik 3', month: 12, day: 13, isHoliday: false },
];

const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
const ANCHOR_DATE = new Date(2024, 0, 1); 
ANCHOR_DATE.setHours(0,0,0,0);
const ANCHOR_PASARAN_INDEX = 1; // Pahing

const getPasaran = (date: Date) => {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((d.getTime() - ANCHOR_DATE.getTime()) / oneDay);
  let resultIndex = (ANCHOR_PASARAN_INDEX + diffDays) % 5;
  if (resultIndex < 0) resultIndex += 5;
  return PASARAN[resultIndex];
};

const toArabicNumerals = (n: number | string) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
};

const NATIONAL_HOLIDAYS: Record<string, string[]> = {
  "1-1": ["Tahun Baru Masehi"],
  "1-5": ["Hari Buruh Internasional"],
  "1-6": ["Hari Lahir Pancasila"],
  "17-8": ["Hari Kemerdekaan RI"],
  "25-12": ["Hari Raya Natal"],
};

const normalizeHijriMonth = (name: string) => {
    const cleanName = name.replace(/^al-/, '').trim();
    if (HIJRI_MONTHS_ID[name]) return HIJRI_MONTHS_ID[name];
    if (HIJRI_MONTHS_ID[cleanName]) return HIJRI_MONTHS_ID[cleanName];
    return name;
};

// --- CORE CALENDAR SCREEN ---

const CalendarScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { prayerData, getHijriDate } = usePrayer();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // States for Holiday / Red Date Click Detail Popups
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalEventNames, setModalEventNames] = useState<string[]>([]);

  // --- GET DETAILED HOLIDAY HISTORY & DETAILS HANDLER ---
  const getEventDetailInfo = (eventName: string, date: Date) => {
    const normalized = eventName.toLowerCase();
    
    if (normalized.includes('tahun baru hijriyah') || (normalized.includes('muharram') && !normalized.includes('asyura') && !normalized.includes('tasu'))) {
      return {
        title: 'Tahun Baru Hijriyah (1 Muharram)',
        category: 'islamic',
        history: 'Sistem penanggalan Hijriah pertama kali ditetapkan pada masa Khalifah Umar bin Khattab ra atas usulan dari Ali bin Abi Thalib ra. Momentum perpindahan (Hijrah) Nabi Muhammad SAW beserta para sahabat dari Makkah ke Madinah dipilih sebagai titik awal tahun ke-1 Hijriah. Hal ini melambangkan keteguhan iman dan babak baru kejayaan peradaban Islam yang diridhai Allah SWT.',
        amalan: 'Membaca doa akhir tahun di malam sisa penanggalan Zulhijjah dan mengawali tahun dengan melafalkan doa awal tahun setelah shalat Maghrib memasuki malam 1 Muharram.',
        dua1: {
          title: 'Doa Akhir Tahun (Dibaca sebelum Maghrib)',
          arabic: 'وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ. اَللَّهُمَّ مَا عَمِلْتُ فِي هَذِهِ السَّسَنَةِ mِمَّا نَهَيْتَنِي عَنْهُ فَلَمْ أَتُبْ مِنْهُ، وَلَمْ تَرْضَهُ وَلَم_ تَنْسَهُ، وَحَلُمْتَ عَلَيَّ بَعْدَ قُدْرَتِكَ عَلَى عُقُوبَتِي، وَدَعَوْتَنِي إِلَى التَّوْبَةِ مِنْهُ بَعْدَ جُرْأَتِي عَلَى مَعْصِيَتِكَ، فَإِنِّي أَسْتَغْفِرُكَ فَاغْفِرْ لِي. وَمَا عَمِلْتُ فِيهَا مِمَّا تَرْضَاهُ وَوَعَدْتَنِي عَلَيْهِ الثَّوَابَ، فَأَسْأَلُكَ اَللَّهُمَّ يَا كَرِيمُ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ أَنْ تَقْبَلَهُ مِنِّي وَلَا تَقْطَعْ رَجَائِي مِنْكَ يَا كَرِيمُ.',
          transliteration: "Wa sallallāhu 'alā sayyidinā muhammadin wa 'alā ālihī wa sahbihī wa sallam. Allāhumma mā 'amiltu fī hāżihis-sanati mimmā nahaitanī 'anhu falam atub minhu, wa lam tardlahu wa lam tansahu, wa halumta 'alayya ba'da qudratika 'alā 'uqūbatī, wa da'autanī ilat-taubati minhu ba'da jur'atī 'alā ma'ṣiyatika, fa-innī astagfiruka fagfir-lī. Wa mā 'amiltu fīhā mimmā tardlāhu wa wa'adtanī 'alaihit-tsawāba, fa-as'aluka allāhumma yā karīmu yā żal-jalāli wal-ikrām an taqabbalahu minnī wa lā taqta' rajā'ī minka yā karīm.",
          translation: '“Semoga Allah melimpahkan rahmat dan keselamatan kepada junjungan kami Nabi Muhammad beserta keluarga dan sahabatnya. Ya Allah, segala kebaikan/keburukan amalan yang telah hamba perbuat pada tahun ini yang Engkau larang sedangkan hamba belum sempat bertaubat, Engkau tidak meridhai namun santun membiarkan hamba, maka hamba mohon ampunan-Mu, ampunilah hamba. Dan segala amalan hamba yang Engkau ridhai dan janjikan fadhilah pahala, terimalah amalan tersebut dan janganlah Engkau putuskan harapan hamba, wahai Engkau Zat Yang Maha Pemurah.”',
          fadhilah: 'Dibaca sebanyak 3 kali di akhir hari bulan Dzulhijjah menjelang masuk waktu Maghrib. Sebagai bentuk taubat atas kemaksiatan setahun ke belakang agar diampuni Allah SWT.'
        },
        dua2: {
          title: 'Doa Awal Tahun (Dibaca setelah Maghrib)',
          arabic: 'وَصَلَّى اللهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ. اَللَّهُمَّ أَنْتَ الْأَبَدِيُّ الْقَدِيمُ الْأَوَّلُ، وَعَلَى فَضْلِكَ الْعَظِيمِ وَجُودِكَ الْمُعَوَّلِ، وَهَذَا عَامٌ جَدِيدٌ قَدْ أَقْبَلَ، أَسْأَلُكَ الْعِصْمَةَ فِيهِ مِنَ الشَّيْطَانِ وَأَوْلِيَائِهِ وَجُنُودِهِ، وَالْعَوْنَ عَلَى هَذِهِ النَّفْسِ الْأَمَّارَةِ بِالسُّوءِ، وَالِاشْتِغَالَ بِمَا يُقَرِّبُنِي إِلَيْكَ زُلْفَى، يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، يَا أَرْحَمَ الرَّاحِمِينَ.',
          transliteration: "Wa sallallāhu 'alā sayyidinā muhammadin wa 'alā ālihī wa sahbihī wa sallam. Allāhumma antal-abadiyyul-qadīmul-awwal, wa 'alā fadlikal-'aẓīmi wa jūdikal-mu'awwal, wa hādżā 'āmun jadīdun qad aqbal, as'alukal-'iṣmata fīhi minasy-syaiṭāni wa auliyā'ihī wa junūdih, wal-'auna 'alā hāżihin-nafsil-ammārati bis-sū', wal-isytigāla bimā yuqarribunī ilaika zulfā, yā żal-jalāli wal-ikrām, yā arhamar-raimīn.",
          translation: '“Ya Allah, Engkau Yang Abadi, Yang Qadim, dan Yang Awal. Atas keutamaan-Mu yang agung dan kemurahan-Mu yang menjadi sandaran, tahun baru ini telah tiba. Hamba memohon kepada-Mu perlindungan dari godaan setan beserta pengikutnya pada tahun ini. Hamba juga memohon pertolongan-Mu mengatasi gejolak nafsu amarah serta kesibukan beribadah agar senantiasa mendekatkan diri hamba kepada-Mu sedekat-dekatnya.”',
          fadhilah: 'Dibaca sebanyak 3 kali setelah shalat Maghrib memasuki malam 1 Muharram. Mengandung permohonan penjagaan dari setan dan kekuatan ibadah selama setahun ke depan.'
        }
      };
    }

    if (normalized.includes('tasu')) {
      return {
        title: 'Hari Tasu\'a (9 Muharram)',
        category: 'islamic',
        history: 'Hari Tasu\'a adalah hari kesembilan dari bulan Muharram. Rasulullah SAW bersabda bahwa sekiranya beliau masih hidup pada tahun berikutnya, beliau sungguh akan berpuasa pada hari kesembilan (Tasu\'a) demi membedakan ibadah umat Islam dari kaum Yahudi yang hanya mengagungkan hari ke-10 (Asyura). Hari ini menjadi momentum penting untuk mempersiapkan diri menyambut hari Asyura dengan meningkatkan ketakwaan dan ibadah.',
        amalan: 'Amalan sunnah yang sangat utama adalah melaksanakan Puasa Sunnah Tasu\'a pada tanggal 9 Muharram. Puasa ini diiringi dengan Puasa Asyura pada keesokan harinya (10 Muharram). Dianjurkan juga untuk memperbanyak dzikir, istighfar, membaca Al-Qur\'an, dan bersedekah.',
        dua1: {
          title: 'Niat Puasa Tasu\'a',
          arabic: 'نَوَيْتُ صَوْمَ تَاسُوعَاءَ سُنَّةً لِلَّهِ تَعَالَى.',
          transliteration: "Nawaitu shauma tāsu'ā'a sunnatan lillāhi ta'ālā.",
          translation: '“Sengaja saya berniat puasa sunnah Tasu’a karena Allah Ta’ala.”',
          fadhilah: 'Niat puasa sunnah yang dibaca pada malam hari atau siang hari sebelum masuk waktu dzuhur sepanjang belum mengonsumsi makanan/minuman apapun sejak subuh.'
        }
      };
    }

    if (normalized.includes('asyura')) {
      return {
        title: 'Hari Asyura (10 Muharram)',
        category: 'islamic',
        history: 'Hari Asyura adalah hari ke-10 bulan Muharram yang sarat akan sejarah kemenangan iman. Pada hari agung ini, Allah SWT menolong Nabi Musa AS beserta Bani Israil meloloskan diri dari kekejaman bala tentara Firaun dengan membelah Laut Merah secara mukjizat, lalu menenggelamkan Firaun. Selain itu, pada hari mulia ini bahtera Nabi Nuh AS akhirnya berlabuh dengan selamat di atas bukit Judi pasca dilanda air bah raksasa di seluruh dunia. Allah juga menerima taubat Nabi Adam AS, menyembuhkan Nabi Ayub AS dari sakit kulit parah, membebaskan Nabi Yunus AS dari perut ikan paus, serta mengangkat Nabi Idris AS ke langit.',
        amalan: 'Amalan sunnah utama yang sangat dianjurkan adalah menjalankan ibadah Puasa Sunnah Asyura pada 10 Muharram untuk melebur dosa setahun yang telah lalu. Sangat baik jika mendampinginya dengan puasa Tasu\'a (9 Muharram) sebagai pembeda dengan kaum Yahudi. Amalan mulia lainnya adalah melonggarkan nafkah belanja rumah tangga untuk keluarga, bersedekah mengasihi anak yatim, serta memperbanyak membaca shalawat zikir.',
        dua1: {
          title: 'Doa Khusus Hari Asyura',
          arabic: 'سُبْحَانَ اللهِ مِلْءَ الْمِيزَانِ وَمُنْتَهَى الْعِلْمِ وَمَبْلَغَ الرِّضَا وَزِنَةَ الْعَرْشِ. لَا مَلْجَأَ وَلَا مَنْجَا مِنَ اللهِ إِلَّا إِلَيْهِ. سُبْحَانَ اللهِ عَدَدَ الشَّفْعِ وَالْوَتْرِ وَعَدَدَ كَلِمَاتِ اللهِ التَّامَّاتِ كُلِّهَا. أَسْأَلُكَ السَّلَامَةَ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ. وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ.',
          transliteration: "Subhānallāhi mil-al-mīzāni wa muntahal-'ilmi wa mablaghar-ridlā wa zinatal-'arsyi. Lā malja-a wa lā manja minallāhi illā ilaih. Subhānallāhi 'adadasy-syaf'i wal-watri wa 'adada kalimātillāhit-tāmmāti kullihā. As-alukas-salāmata birahmatika yā arhamar-rāhimīn. Wa lā haula wa lā quwwata illā billāhil-'aliyyil-'adhīm.",
          translation: '“Maha Suci Allah sepenuh timbangan, sepuncak ilmu, sebatas keridhaan, dan seberat timbangan Arsy. Tidak ada tempat berlindung serta tidak ada tempat menyelamatkan diri dari murka Allah kecuali berserah kepada-Nya. Maha Suci Allah sebanyak hitungan genap dan ganjil, dan sebanyak untaian kalimat-kalimat Allah yang sempurna seluruhnya. Hamba memohon perlindungan & keselamatan dengan kasih sayang-Mu wahai Tuhan yang Paling Pengasih.”',
          fadhilah: 'Dianjurkan dibaca secara istiqomah di hari Asyura sebanyak 70 kali untuk memperoleh keselamatan dari musibah dan keburukan dalam setahun penuh.'
        },
        dua2: {
          title: 'Hasbunallah & Doa Perlindungan',
          arabic: 'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ. يَا قَابِلَ تَوْبَةِ آدَمَ يَوْمَ عَاشُورَاءَ، يَا فَارِجَ كَرْبِ ذِي النُّونِ يَوْمَ عَاشُورَاءَ، يَا جَامِعَ شَمْلِ يَعْقُوبَ يَوْمَ عَاشُورَاءَ، يَا سَامِعَ دَعْوَةِ مُوسَى وَهَارُونَ يَوْمَ عَاشُورَاءَ، يَا خَالِقَ نُورِ مُحَمَّدٍ صَلَّى اللهِ عَلَيْهِ وَسَلَّمَ يَوْمَ عَاشُورَاءَ، يَا رَحْمَنَ الدُّنْيَا وَالْآخِرَةِ وَرَحِيمَهُمَا، صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، وَاجْعَلْ لَنَا مِنْ كُلِّ ضِيقٍ مَخْرَجًا وَمِنْ كُلِّ هَمٍّ فَرَجًا بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ.',
          transliteration: "Hasbunallāhu wa ni'mal-wakīl ni'mal-maulā wa ni'man-naṣīr. Yā qābila taubati Ādama yauma 'Āsyūrā', yā fārija karbi żīn-Nūni yauma 'Āsyūrā', yā jāmi'a syamli Ya'qūba yauma 'Āsyūrā', yā sāmi'a da'wati Mūsā wa Hārūna yauma 'Āsyūrā', yā khāliqa nūri Muhammadin ṣallallāhu 'alaihi wa sallama yauma 'Āsyūrā', yā rahmānad-dun-yā wal-ākhirati wa rahīmahumā, ṣalli 'alā sayyidinā Muhammadin wa 'alā āli sayyidinā Muhammadin, waj'al lanā min kulli dīqin makhrajan wa min kulli hammin farajan birahmatika yā arhamar-rāhimīn.",
          translation: '“Cukuplah Allah bagi kami dan Dia adalah sebaik-baik penolong, sebaik-baik pelindung, dan sebaik-baik penolong. Wahai Yang menerima taubat Nabi Adam pada hari Asyura, Wahai Yang menghilangkan kesedihan Nabi Yunus pada hari Asyura, Wahai Yang mengumpulkan kembali keluarga Nabi Yaqub pada hari Asyura, Wahai Yang mendengar doa Nabi Musa dan Nabi Harun pada hari Asyura, Wahai Yang menciptakan cahaya Nabi Muhammad SAW pada hari Asyura, Wahai Yang Maha Pengasih dan Maha Penyayang di dunia dan akhirat, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad beserta keluarganya, dan jadikanlah untuk kami jalan keluar dari setiap kesempitan serta kelapangan dari setiap kesedihan dengan rahmat-Mu, wahai Tuhan Yang Maha Pengasih.”',
          fadhilah: 'Dibaca sebanyak 70 kali (untuk kalimat Hasbunallah) dan dilanjutkan dengan doa tersebut di hari Asyura untuk mendapatkan perlindungan, dilapangkan rezeki, dan dibebaskan dari kesulitan sepanjang tahun.'
        }
      };
    }

    if (normalized.includes('maulid')) {
      return {
        title: 'Maulid Nabi Muhammad SAW (12 Rabiul Awal)',
        category: 'islamic',
        history: 'Memperingati kelahiran agung utusan Allah, pelita kegelapan dunia, yaitu baginda Rasulullah SAW pada hari Senin, 12 Rabiul Awal di tahun Gajah, kota Makkah. Kelahiran beliau merupakan karunia hidayah dan rahmat terbesar yang Allah limpahkan bagi seisi alam semesta (Rahmatan lil \'Alamin) guna membimbing umat dari kegelapan menuju cahaya iman.',
        amalan: 'Mengekspresikan rasa syukur dengan memperbanyak bacaan shalawat nabi secara khidmat, mendalami sirah nabawiyah, memperdalam sunnah harian, bersedekah makanan, menyantuni fakir miskin, dan mempererat ukhuwah islamiyah.',
        dua1: {
          title: 'Shalawat Ibrahimiyah',
          arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ.',
          transliteration: "Allāhumma ṣalli 'alā sayyidinā muhammadin wa 'alā āli sayyidinā muhammadin kamā ṣallaita 'alā sayyidinā ibrāhīma wa 'alā āli sayyidinā ibrāhīma, wa bārik 'alā sayyidinā muhammadin wa 'alā āli sayyidinā muhammadin kamā bārakta 'alā sayyidinā ibrāhīma wa 'alā āli sayyidinā ibrāhīma, fil-'ālamīna innaka hamīdun majīd.",
          translation: '“Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad beserta keluarganya sebagaimana Engkau limpahkan rahmat kepada Nabi Ibrahim beserta keluarganya. Serta berkahilah junjungan kami Nabi Muhammad beserta keluarganya sebagaimana Engkau berkahi Nabi Ibrahim beserta keluarganya di seantero alam sekalian. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.”',
          fadhilah: 'Shalawat yang paling utama di mana membacanya mendatangkan syafaat Rasulullah SAW kelak di hari Kiamat.'
        }
      };
    }

    if (normalized.includes("isra mi'raj") || normalized.includes('isra')) {
      return {
        title: "Isra Mi'raj (27 Rajab)",
        category: 'islamic',
        history: 'Isra Mi\'raj merupakan mukjizat agung satu malam yang dianugerahkan Allah kepada Baginda Rasulullah SAW di tahun kesedihan (\'Amul Huzni). Isra\' adalah perjalanan super cepat melintasi bumi dari Masjidil Haram ke Masjidil Aqsa. Sementara Mi\'raj adalah kenaikan beliau menembus ketujuh lapis langit hingga Sidratul Muntaha guna menghadap langsung ke hadirat Allah Jalla Jalaluh, di mana beliau menerima perintah shalat lima waktu sehari semalam.',
        amalan: 'Meningkatkan kualitas pengerjaan shalat fardhu lima waktu secara khusyuk dan tepat waktu, memperbanyak shalat-shalat sunnah, memperbanyak istigfar bertaubat di bulan mulia Rajab, serta mengkaji kembali nilai-nilai spiritualistas shalat.',
        dua1: {
          title: 'Doa Memohon Kekhusyukan Shalat',
          arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ.',
          transliteration: "Rabbij-'alnī muqīmas-ṣalāti wa min żurriyyatī, Rabbanā wa taqabbal du'ā'.",
          translation: '“Wahai Tuhanku, jadikanlah hamba pribadi yang senantiasa teguh mendirikan ibadah shalat secara sempurna, demikian pula keturunan-keturunan hamba kelak. Wahai Tuhan kami, perkenankanlah untaian doa hamba ini.” (QS. Ibrahim: 40)',
          fadhilah: 'Doa agung dari Al-Qur\'an memohon keteguhan iman dan fisik dalam merutinkan ibadah shalat secara khusyuk.'
        }
      };
    }

    if (normalized.includes('idul fitri')) {
      return {
        title: 'Hari Raya Idul Fitri (1 Syawal)',
        category: 'islamic',
        history: 'Hari raya kemenangan agung seluruh mukmin setelah melaksanakan perjuangan tarbiyah spiritual sebulan penuh mengendalikan gejolak nafsu di bulan suci Ramadhan. Mengembalikan kesucian (Fitrah) seorang hamba bersih dari dosa bagaikan bayi yang lahir kembali.',
        amalan: 'Menunaikan kewajiban Zakat Fitrah sebelum shalat Id, melantunkan gema gembira takbiran, melaksanakan shalat Idul Fitri, bermaaf-maafan (Halal bi Halal), serta berpuasa sunnah Syawal selama 6 hari.',
        dua1: {
          title: 'Doa Idul Fitri (Saling Mendoakan)',
          arabic: 'تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ وَصَالِحَ الْأَعْمَالِ كُلَّ عَامٍ وَأَنْتُمْ بِخَيْرٍ.',
          transliteration: "Taqabbalallāhu minnā wa minkum wa ṣālihal-a'māl, kullu 'āmin wa antum bikhair.",
          translation: '“Semoga Allah senantiasa berkenan menerima ketulusan amal ibadah dari kami dan juga dari kalian semuanya. Semoga kalian selalu berada dalam lindungan kebaikan setiap tahun.”',
          fadhilah: 'Ucapan doa mulia antar sesama mukmin di hari raya utama.'
        }
      };
    }

    if (normalized.includes('idul adha') || normalized.includes('qurban')) {
      return {
        title: 'Hari Raya Idul Adha / Qurban (10 Dzulhijjah)',
        category: 'islamic',
        history: 'Hari raya agung yang memperingati kepatuhan tauhid mutlak Nabi Ibrahim AS dan keikhlasan penyerahan diri yang luar biasa dari Nabi Ismail AS dalam menjalankan perintah pengorbanan dari Allah SWT. Sebagai ganjaran ketaatan tersebut, Allah dengan kemuliaan-Nya mengganti sembelihan dengan domba jantan yang gemuk dari surga.',
        amalan: 'Menunaikan shalat Idul Adha, menyembelih hewan Qurban bagi yang memiliki keluasan rezeki guna dibagikan kepada kaum dhuafa, melarang puasa di hari nahar serta hari tasyrik, dan memperbanyak gema takbir.',
        dua1: {
          title: 'Doa Penyembelihan Qurban',
          arabic: 'بِسْمِ اللَّهِ اللَّهُمَّ تَقَبَّلْ مِنْ مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَمِنْ أُمَّةِ مُحَمَّدٍ.',
          transliteration: "Bismillāh, Allāhumma taqabbal min muhammadin wa āli muhammadin wa min ummati muhammad.",
          translation: '“Dengan menyebut nama Allah. Ya Allah, terimalah ibadah qurban ini dari Muhammad, segenap keluarga Muhammad, serta seluruh umat Muhammad.”',
          fadhilah: 'Membaca doa ini melengkapi kesyahduan syiar berqurban agar diridhai.'
        }
      };
    }

    if (normalized.includes('tasyrik')) {
      return {
        title: 'Hari Tasyrik (11, 12, 13 Dzulhijjah)',
        category: 'islamic',
        history: 'Hari-hari makan, minum, dan memperbanyak zikrullah setelah Idul Adha. Dinamakan tasyrik karena pada zaman purba, orang-orang menjemur daging qurban di bawah terik matahari (tasyriq) di Mina agar menjadi dendeng kering yang awet.',
        amalan: 'Diharamkan menjalankan ibadah puasa pada hari tasyrik. Sunnah utama adalah makan minum bersama sahabat seraya bersyukur atas nikmat, bertakbir mutlak di penghujung shalat fardhu, dan membaca zikir sapu jagat.',
        dua1: {
          title: 'Doa Sapu Jagat (Banyak dibaca di Hari Tasyrik)',
          arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.',
          transliteration: "Rabbanā ātinā fid-dunyā hasanatah, wa fil-ākhirati hasanatah, wa qinā 'ażāban-nār.",
          translation: '“Wahai Tuhan kami, karuniakanlah kebahagiaan hidup sejati di dunia ini, serta kebahagiaan hidup di akhirat kelak, dan selamatkanlah kami dari siksaan aspal api neraka.”',
          fadhilah: 'Amalan doa yang paling disukai dan paling sering didengungkan Rasulullah SAW.'
        }
      };
    }

    if (normalized.includes('ramadhan') || normalized.includes('ramadan')) {
      return {
        title: 'Awal Bulan Suci Ramadhan',
        category: 'islamic',
        history: 'Menandai tibanya bulan agung di mana pintu-pintu surga dibuka lebar-lebar, pintu neraka ditutup rapat, dan setan-setan dibelenggu kekuasaan ilahi. Bulan diturunkannya mukjizat Al-Qur\'an secara utuh ke langit dunia pada malam Lailatul Qadar.',
        amalan: 'Mengerjakan Puasa Ramadhan fardhu sebulan penuh, melaksanakan shalat sunnah Tarawih sepanjang malam, tadarus Al-Qur\'an, memperbanyak porsi sedekah, dan menyambut Lailatul Qadar.',
        dua1: {
          title: 'Doa Niat Puasa Ramadhan',
          arabic: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ Lِلَّهِ تَعَالَى.',
          transliteration: "Nawaitu shauma ghadin 'an adā-i fardhi syahri ramadhāna hāżihis-sanati lillāhi ta'ālā.",
          translation: '“Sengaja hamba berniat puasa esok hari untuk menunaikan fardhu bulan Ramadhan tahun ini, semata-mata ikhlas karena Allah Ta’ālā.”',
          fadhilah: 'Niat yang diucapkan pada malam hari sebagai prasyarat sahnya pengerjaan ibadah puasa wajib.'
        }
      };
    }

    if (normalized.includes('nuzulul')) {
      return {
        title: "Malam Nuzulul Qur'an (17 Ramadhan)",
        category: 'islamic',
        history: 'Peringatan momentum diturunkannya wahyu Al-Qur\'an pertama kali yaitu Surah Al-Alaq ayat 1-5 kepada Rasulullah SAW melalui perantara malaikat Jibril saat beliau sedang bertasbih di Gua Hira, kota Makkah, pada tanggal 17 Ramadhan.',
        amalan: 'Memperbanyak tadarus Al-Qur\'an, mengkaji tafsir maknanya, memperbanyak qiyamul lail (shalat malam), serta bershalawat atas Nabi SAW.',
        dua1: {
          title: "Doa Memohon Keberkahan Al-Qur'an",
          arabic: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً. اللَّهُمَّ دَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.',
          transliteration: "Allāhummar-hamnī bil-qur'āni waj-'alhu lī imāmaw-wa nūraw-wa hudaw-wa rahmah. Allāhumma żakkirnī minhu mā nasītu wa 'allimnī minhu mā jahiltu war-zuqnī tilāwatahu ānā-allaili wa atrāfan-nahāri waj-'alhu lī hujjataiy-yā Rabbal-'ālamīn.",
          translation: '“Ya Allah, limpahkanlah kasih sayang-Mu kepadaku berkat Al-Qur’an serta jadikanlah ia sebagai pemimpin, cahaya penuntun, petunjuk jalanku, dan rahmat-Mu.”',
          fadhilah: 'Doa agung khatam Qur\'an memohon agar Al-Qur\'an menjadi sumber hidayah hidup yang menyelamatkan di akhirat.'
        }
      };
    }

    if (normalized.includes('nisfu')) {
      return {
        title: "Nisfu Syakban (15 Sya'ban)",
        category: 'islamic',
        history: 'Nisfu Syakban adalah malam pertengahan bulan Sya\'ban. Dalam tradisi umat Islam dan ulama salaf Ahlussunnah wal Jama\'ah, malam ini diyakini sebagai malam mulia penuh ampunan dan rahmat. Pada malam agung ini, seluruh lembaran catatan amal perbuatan manusia selama satu tahun penuh ditutup dan dilaporkan kehadirat Allah SWT, serta merupakan malam penetapan takdir rezeki, jodoh, dan ajal untuk tahun ke depan.',
        amalan: 'Dianjurkan menghidupkan malam Nisfu Syakban dengan memperbanyak shalat sunnah mutlak atau tasbih, membaca Surah Yasin sebanyak 3 kali (pertama berniat memohon panjang umur dalam ketaatan, kedua berniat memohon dilapangkan rezeki yang halal dan barokah, ketiga berniat memohon ditetapkan iman dan husnul khatimah), serta memperbanyak doa dan memohon ampunan (istighfar).',
        dua1: {
          title: 'Doa Nisfu Syakban',
          arabic: 'اللَّهُمَّ يَا ذَا الْمَنِّ وَلَا يُمَنُّ عَلَيْهِ، يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، يَا ذَا الطَّوْلِ وَالْإِنْعَامِ. لَا إِلَهَ إِلَّا أَنْتَ ظَهْرَ اللَّاجِئينَ، وَجَارَ الْمُسْتَجِيرِينَ، وَأَمَانَ الْخَائِفِينَ. اللَّهُمَّ إِنْ كُنْتَ كَتَبْتَنِي عِنْدَكَ فِي أُمِّ الْكِتَابِ شَقِيًّا أَوْ مَحْرُومًا أَوْ مَطْرُودًا أَوْ مُقَتَّرًا عَلَيَّ فِي الرِّزْقِ، فَامْحُ اللَّهُمَّ بِفَضْلِكَ شَقَاوَتِي وَحِرْمَانِي وَطَرْدِي وَإِقْتَارَ رِزْقِي، وَأَثْبِتْنِي عِنْدَكَ فِي أُمِّ الْكِتَابِ سَعِيدًا مَرْزُوقًا مُوَفَّقًا لِلْخَيْرَاتِ.',
          transliteration: "Allāhumma yā żal-manni wa lā yumannu 'alaih, yā żal-jalāli wal-ikrām, yā żat-ṭauli wal-in'ām. Lā ilāha illā anta ẓahral-lājī'īn, wa jāral-mustajīrīn, wa amānal-khā'ifīn. Allāhumma in kunta katabtanī 'indaka fī ummil-kitābi syaqiyyan au maḥrūman au maṭrūdan au muqattaran 'alayya fir-rizq, fam-hullāhumma bifadlika syaqāwatī wa ḥirmānī wa ṭardī wa iqtāra rizqī, wa aṡbitnī 'indaka fī ummil-kitābi sa'īdan marzūqan muwaffaqal-lil-khairāt.",
          translation: '“Ya Allah, wahai Dzat yang mempunyai anugerah dan tidak dianugerahi atas-Nya, wahai Pemilik keagungan dan kemuliaan, wahai Pemilik karunia dan kenikmatan. Tiada Tuhan selain Engkau tempat berlindung bagi orang-orang yang mengungsi, pelindung bagi orang-orang yang memohon perlindungan, dan pemberi keamanan bagi orang-orang yang ketakutan. Ya Allah, jika Engkau telah menulis diriku di sisi-Mu dalam Induk Kitab sebagai orang yang celaka, terhalang, terusir, atau disempitkan rezeki, maka hapuslah ya Allah dengan karunia-Mu kecelakaanku, kehalanganku, pengusiranku, dan kesempitan rezekiku, dan tetapkanlah hamba di sisi-Mu dalam Induk Kitab sebagai orang yang bahagia, murah rezeki, dan diberi taufiq untuk melakukan segala kebaikan.”',
          fadhilah: 'Dibaca setelah membaca Surah Yasin sebanyak 3 kali pada malam Nisfu Syakban untuk memohon keberkahan umur, ketetapan iman, dan rezeki yang melimpah.'
        }
      };
    }

    if (normalized.includes('arafah')) {
      return {
        title: 'Hari Arafah (9 Dzulhijjah)',
        category: 'islamic',
        history: 'Hari Arafah adalah hari ke-9 bulan Dzulhijjah yang merupakan puncak dari seluruh rangkaian ibadah haji. Pada hari agung ini, seluruh jamaah haji dari berbagai penjuru dunia berkumpul melakukan wukuf di Padang Arafah. Bagi kaum muslimin yang sedang tidak melaksanakan ibadah haji, hari mulia ini memiliki fadhilah yang sangat agung untuk menyucikan jiwa dan memohon ampunan Allah SWT.',
        amalan: 'Amalan paling utama bagi umat Islam yang tidak melaksanakan ibadah haji adalah menunaikan ibadah Puasa Sunnah Arafah. Disunnahkan juga memperbanyak bacaan tahlil, takbir, tahmid, istighfar, serta memanjatkan doa-doa mustajab sepanjang hari.',
        dua1: {
          title: 'Niat Puasa Arafah',
          arabic: 'نَوَيْتُ صَوْمَ عَرَفَةَ سُنَّةً لِلَّهِ تَعَالَى.',
          transliteration: "Nawaitu shauma 'arafata sunnatan lillāhi ta'ālā.",
          translation: '“Sengaja hamba berniat puasa sunnah Arafah karena Allah Ta’ālā.”',
          fadhilah: 'Puasa sunnah pada tanggal 9 Dzulhijjah yang dapat menghapuskan dosa setahun yang lalu dan dosa setahun yang akan datang berdasarkan hadis shahih riwayat Imam Muslim.'
        },
        dua2: {
          title: 'Dzikir Utama Hari Arafah',
          arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
          transliteration: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu, wa huwa 'alā kulli syai'in qadīr.",
          translation: '“Tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya segala kerajaan, bagi-Nya segala pujian, dan Dia Maha Kuasa atas segala sesuatu.”',
          fadhilah: 'Rasulullah SAW bersabda: "Sebaik-baik doa adalah doa pada hari Arafah, dan sebaik-baik kalimat yang aku dan para nabi sebelumku ucapkan adalah dzikir ini." (HR. Tirmidzi).'
        }
      };
    }

    if (normalized.includes('khaybar') || normalized.includes('khaibar')) {
      return {
        title: 'Pembebasan Khaybar (10 Rajab)',
        category: 'islamic',
        history: 'Peristiwa Pembebasan Khaybar terjadi pada bulan Rajab tahun 7 Hijriah. Khaybar merupakan daerah perkebunan subur yang kokoh dengan benteng-benteng pertahanan raksasa, yang menjadi pusat persekutuan musuh untuk menyerang Madinah. Pasukan Islam yang dipimpin langsung oleh Rasulullah SAW—dengan peran heroik Sayyidina Ali bin Abi Thalib ra yang membelah gerbang pertahanan—berhasil menaklukkan benteng-benteng tersebut. Kemenangan ini meruntuhkan pusat konspirasi musuh, menjamin stabilitas dakwah, dan memberikan kemakmuran bagi kaum muslimin.',
        amalan: 'Mengkaji sirah nabawiyah mengenai kisah kepemimpinan, persatuan, dan strategi perang Rasulullah SAW, memperbanyak doa memohon keteguhan iman dan kejayaan bagi umat Islam di seluruh penjuru dunia, serta meningkatkan ketakwaan dan rasa syukur.',
        dua1: {
          title: 'Doa Memohon Keteguhan Iman & Kemenangan',
          arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ.',
          transliteration: "Rabbanā afrig 'alainā ṣabraw-wa ṡabbit aqdāmanā wan-ṣurnā 'alal-qaumil-kāfirīn.",
          translation: '“Wahai Tuhan kami, limpahkanlah kesabaran yang melimpah atas diri kami, teguhkanlah pendirian kami, dan tolonglah kami dalam menghadapi kaum yang ingkar.” (QS. Al-Baqarah: 250)',
          fadhilah: 'Doa agung dari Al-Qur\'an untuk memohon ketahanan jiwa, keteguhan hati, serta kemenangan dalam menghadapi segala rintangan hidup.'
        }
      };
    }

    if (normalized.includes('senin') && (normalized.includes('puasa') || normalized.includes('senin'))) {
      return {
        title: 'Ibadah Puasa Sunnah Hari Senin',
        category: 'islamic',
        history: 'Puasa sunnah Senin adalah amalan rutin mingguan yang sangat dicintai oleh Rasulullah SAW. Ketika beliau ditanya mengapa berpuasa pada hari Senin, beliau bersabda: "Hari itu adalah hari kelahiranku, hari aku diutus atau diturunkannya wahyu Al-Qur\'an kepadaku." (HR. Muslim). Selain itu, Senin merupakan hari di mana pintu-pintu surga dibuka dan seluruh amal perbuatan hamba dihadapkan kepada Allah SWT.',
        amalan: 'Melaksanakan puasa sunnah di hari Senin dengan menjaga pancaindera dari kemaksiatan, menyibukkan diri dengan membaca sholawat atas Nabi, membaca Al-Qur\'an, bersedekah, serta mempererat tali persaudaraan sesama muslim.',
        dua1: {
          title: 'Niat Puasa Sunnah Hari Senin',
          arabic: 'نَوَيْتُ صَوْمَ يَوْمِ الِاثْنَيْنِ سُنَّةً لِلَّهِ تَعَالَى.',
          transliteration: "Nawaitu shauma yaumil-iṡnaini sunnatan lillāhi ta'ālā.",
          translation: '“Sengaja hamba berniat puasa sunnah hari Senin karena Allah Ta’ālā.”',
          fadhilah: 'Niat yang dibaca malam hari atau siang hari sebelum waktu dzuhur, mendatangkan pahala sunnah, kebugaran jasmani, and kecintaan dari Rasulullah SAW.'
        }
      };
    }

    if (normalized.includes('kamis') && (normalized.includes('puasa') || normalized.includes('kamis'))) {
      return {
        title: 'Ibadah Puasa Sunnah Hari Kamis',
        category: 'islamic',
        history: 'Hari Kamis merupakan hari istimewa di mana seluruh rekapitulasi amalan ibadah manusia selama sepekan diangkat dan dilaporkan ke hadirat Allah SWT. Rasulullah SAW bersabda: "Amal-amal manusia diperiksa di hadapan Allah dalam setiap pekan dua kali, yaitu pada hari Senin dan hari Kamis. Maka aku menyukai amalanku diperiksa saat aku sedang berpuasa." (HR. Muslim).',
        amalan: 'Menjalankan puasa sunnah hari Kamis, memperbanyak istighfar memohon ampunan atas kekhilafan selama sepekan ke belakang, bersedekah makanan untuk orang yang berpuasa, serta membaca zikir harian.',
        dua1: {
          title: 'Niat Puasa Sunnah Hari Kamis',
          arabic: 'نَوَيْتُ صَوْمَ يَوْمِ الْخَمِيسِ سُنَّةً لِلَّهِ تَعَالَى.',
          transliteration: "Nawaitu shauma yaumil-khamīsi sunnatan lillāhi ta'ālā.",
          translation: '“Sengaja hamba berniat puasa sunnah hari Kamis karena Allah Ta’ālā.”',
          fadhilah: 'Membiasakan diri berpuasa Kamis melatih keistiqomahan ibadah dan menyucikan jiwa dari sifat keduniawian.'
        }
      };
    }

    if (normalized.includes('jumat sayyidul') || normalized.includes('sayyidul ayyam') || (normalized.includes('jumat') && normalized.includes('ayyam'))) {
      return {
        title: 'Hari Jumat Sayyidul Ayyam (Pemimpin Segala Hari)',
        category: 'islamic',
        history: 'Hari Jumat diistilahkan sebagai "Sayyidul Ayyam" yang berarti rajanya hari-hari dalam sepekan. Hari Jumat adalah hari raya mingguan bagi umat Islam yang dipenuhi dengan rahmat, keberkahan, dan ampunan. Berbagai peristiwa besar terjadi pada hari Jumat, di antaranya: penciptaan Nabi Adam AS, diturunkannya beliau ke bumi, masuknya beliau ke dalam surga, wafatnya beliau, serta pada hari Jumat pulalah hari kiamat akan terjadi.',
        amalan: 'Dianjurkan mandi sunnah Jumat, memotong kuku, membersihkan badan, mengenakan pakaian putih bersih yang rapi, memakai wewangian (bagi pria), bersegera ke masjid untuk melaksanakan shalat Jumat berjamaah, memperbanyak shalawat atas Nabi SAW, bersedekah (Jumat Berkah), serta membaca Surah Al-Kahfi.',
        dua1: {
          title: 'Doa Sore Hari Jumat (Waktu Mustajab)',
          arabic: 'اللَّهُمَّ يَا بَارِئَ النُّفُوسِ وَيَا جَامِعَ الشَّتَاتِ، اِقْضِ حَاجَتِي وَاغْفِرْ ذَنْبِي وَتَقَبَّلْ صَلَاتِي يَا حَيُّ يَا قَيُّومُ.',
          transliteration: "Allāhumma yā bāri'an-nufūsi wa yā jāmi'asy-syatāt, iqdli ḥājatī wagfir żanbī wa taqabbal ṣalātī yā Ḥayyu yā Qayyūm.",
          translation: '“Ya Allah Pencipta jiwa-jiwa dan Penghimpun segala yang bercerai-berai, kabulkanlah hajatku, ampunilah dosaku, dan terimalah shalatku, wahai Tuhan Yang Maha Hidup lagi Senantiasa Berdiri Sendiri.”',
          fadhilah: 'Terdapat satu waktu yang sangat mustajab di hari Jumat, diyakini berada di antara waktu ashar hingga terbenamnya matahari, di mana doa tidak akan ditolak oleh Allah SWT.'
        }
      };
    }

    if (normalized.includes('rebo') || normalized.includes('wekasan')) {
      return {
        title: 'Tradisi Rebo Wekasan (Rabu Terakhir Bulan Safar)',
        category: 'islamic',
        history: 'Rebo Wekasan (atau Rabu Pamungkas) adalah tradisi keagamaan masyarakat Islam Nusantara, khususnya di kalangan pesantren Jawa dan Madura, yang jatuh pada hari Rabu terakhir di bulan Safar. Tradisi ini merujuk pada penjelasan ulama thariqah dan ahli kasyaf bahwa pada hari Rabu terakhir bulan Safar, Allah SWT menurunkan berbagai macam bala bencana ke bumi. Oleh karenanya, para ulama menyusun amalan doa dan shalat sunnah mutlak guna memohon keselamatan, perlindungan, dan tolak bala agar terhindar dari marabahaya.',
        amalan: 'Melaksanakan shalat sunnah mutlak Lidaf\'il Bala (tolak bala) sebanyak 4 rakaat, memperbanyak sedekah kepada kaum dhuafa, bersilaturahmi, membaca Surah Yasin, dan membaca doa tolak bala bulan Safar bersama-sama.',
        dua1: {
          title: 'Doa Tolak Bala Rebo Wekasan',
          arabic: 'اللَّهُمَّ يَا شَدِيدَ الْقُوَى وَيَا شَدِيدَ الْمِحَالِ، يَا عَزِيزُ يَا مَنْ ذَلَّتْ لِعِظَمَتِكَ جَمِيعُ خَلْقِكَ، اِكْفِنِي مِنْ شَرِّ خَلْقِكَ، يَا مُحْسِنُ يَا مُجْمِلُ يَا مُنْعِمُ يَا مُفْضِلُ، يَا لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ. اللَّهُمَّ ادْفَعْ عَنَّا الْبَلَاءَ وَالْغَلَاءَ وَالْوَبَاءَ وَجَمِيعَ الْفِتَنِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ.',
          transliteration: "Allāhumma yā syadīdal-quwā wa yā syadīdal-miḥāl, yā 'Azīzu yā man żallat li'aẓamatika jamī'u khalqik, ikfinī min syarri khalqik, yā Muḥsinu yā Mujmilu yā Mun'imu yā Mufdlil, yā lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn. Allāhummad-fa' 'annal-balā'a wal-galā'a wal-wabā'a wa jamī'al-fitani mā ẓahara minhā wa mā baṭan.",
          translation: '“Ya Allah, wahai Tuhan Yang Maha Dahsyat kekuatan-Nya, wahai Tuhan Yang Maha Perkasa, wahai Yang mengalahkan seluruh makhluk dengan keagungan-Nya, cukupkanlah aku dari keburukan makhluk-Mu. Wahai Yang Maha Baik, Maha Memperindah, Maha Memberi Nikmat, Maha Utama. Tiada Tuhan selain Engkau, Maha Suci Engkau sesungguhnya aku termasuk orang-orang yang zalim. Ya Allah, hindarkanlah kami dari mara bencana, mahalnya harga pangan, wabah penyakit, dan segala huru-hara fitnah, baik yang tampak maupun yang tersembunyi.”',
          fadhilah: 'Dibaca secara bersama-sama setelah shalat tolak bala pada hari Rabu terakhir bulan Safar guna memohon perlindungan utuh lahir batin dari segala musibah.'
        }
      };
    }

    if (normalized.includes('lailatul') || normalized.includes('10 hari terakhir')) {
      return {
        title: '10 Hari Terakhir Ramadhan (Memburu Lailatul Qadar)',
        category: 'islamic',
        history: 'Sepuluh malam terakhir di bulan suci Ramadhan adalah fase klimaks ibadah yang paling mulia dan dinanti-nanti. Rasulullah SAW senantiasi mengencangkan ikat pinggangnya, membangunkan keluarganya, dan menghidupkan malam-malam ini dengan i\'tikaf dan ruku\' sujud di masjid. Pada fase ini terdapat satu malam rahasia yang dirahasiakan Allah SWT, yaitu Lailatul Qadar—malam mulia yang keutamaannya lebih baik daripada beribadah selama 1.000 bulan (sekitar 83 tahun).',
        amalan: 'Melaksanakan ibadah i\'tikaf di masjid (terutama pada malam-malam ganjil: 21, 23, 25, 27, 29 Ramadhan), memperbanyak shalat malam (Tahajud, Hajat, Witir, Tasbih), tadarus Al-Qur\'an, meningkatkan porsi sedekah, serta memperbanyak taubat dan doa keampunan.',
        dua1: {
          title: 'Doa Utama Malam Lailatul Qadar',
          arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.',
          transliteration: "Allāhumma innaka 'afuwwun tuḥibbul-'afwa fa'fu 'annī.",
          translation: '“Ya Allah, sesungguhnya Engkau Maha Pengampun lagi Maha Pemaaf, Engkau sangat menyukai pengampunan, maka ampunilah segala dosa dan kesalahan hamba.”',
          fadhilah: 'Doa agung yang diajarkan langsung oleh Rasulullah SAW kepada Ibunda Aisyah ra untuk senantiasa dilantunkan di sepuluh malam terakhir Ramadhan.'
        }
      };
    }

    if (normalized.includes('ayyamul') || normalized.includes('bidh')) {
      return {
        title: 'Puasa Sunnah Yaumul Bidh (Pertengahan Bulan Hijriah)',
        category: 'islamic',
        history: 'Yaumul Bidh atau "Hari-hari Putih" merujuk pada tanggal 13, 14, dan 15 dari setiap bulan dalam kalender Hijriah. Dinamakan demikian karena pada malam-malam tersebut bulan purnama bersinar dengan sangat terang benderang sehingga menerangi bumi dengan cahaya putih bersih. Rasulullah SAW senantiasa berpesan kepada para sahabat agar merutinkan puasa tiga hari ini di setiap bulannya, yang pahalanya disejajarkan oleh Allah SWT dengan pahala puasa sepanjang tahun (setahun penuh) apabila dikerjakan secara konsisten.',
        amalan: 'Menunaikan Puasa Sunnah Yaumul Bidh selama tiga hari berturut-turut pada tanggal 13, 14, dan 15 di bulan berjalan (kecuali bulan Ramadhan). Diiringi dengan memperbanyak sholawat, zikir, membaca Al-Qur\'an, bersedekah, serta memperbanyak akhlak mulia.',
        dua1: {
          title: 'Niat Puasa Yaumul Bidh',
          arabic: 'نَوَيْتُ صَوْمَ أَيَّامِ الْبِيضِ سُنَّةً لِلَّهِ تَعَالَى.',
          transliteration: "Nawaitu shauma ayyāmil-bīḍi sunnatan lillāhi ta'ālā.",
          translation: '“Sengaja hamba berniat puasa sunnah hari-hari putih (Yaumul Bidh) karena Allah Ta’ālā.”',
          fadhilah: 'Membiasakan diri berpuasa Yaumul Bidh setiap bulan merupakan sunnah muakkad yang melatih kedisiplinan spiritual harian dan mendatangkan limpahan keberkahan pahala.'
        }
      };
    }

    const isSunday = date.getDay() === 0;
    if (isSunday) {
      return {
        title: 'Hari Ahad (Minggu) - Hari Libur',
        category: 'sunday',
        history: 'Dalam tradisi pesantren Nusantara, hari Ahad merupakan waktu tenang sekiranya kegiatan belajar formal diliburkan sebentar guna memberi relaksasi istirahat bagi fisik dan pikiran para santri.',
        amalan: 'Gunakan waktu libur hari Ahad secara bijak untuk mempererat tali silaturahim dengan keluarga tercinta atau berbakti membersihkan pondok pesantren, merapikan catatan ilmu, memperkuat bacaan hafalan Al-Qur\'an.',
        dua1: {
          title: 'Doa Memohon Kelapangan Rezeki & Umur Berkah',
          arabic: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي وَوَسِّعْ Lِي فِي دَارِي وَبَارِكْ لِي فِي رِزْقِي.',
          transliteration: "Allāhumma aṣliḥ lī dīnī, wa wassi' lī fī dārī, wa bārik lī fī rizqī.",
          translation: '“Ya Allah perbaikilah ketaatan agamaku, lapangkanlah ketentraman tempat tinggalku, serta limpahkanlah berkah kemuliaan dalam sepanjang bentangan rezekiku.”',
          fadhilah: 'Membaca doa harian ini selepas shalat meluaskan pintu rezeki zahir bathin.'
        }
      };
    }

    return {
      title: eventName,
      category: 'national',
      history: `Merupakan hari besar nasional Indonesia: ${eventName}. Ditetapkan sebagai hari libur resmi untuk memperingati peristiwa penting kenegaraan, kontribusi perjuangan kemasyarakatan, ataupun hari besar keberagaman umat beragama.`,
      amalan: 'Mengisi waktu libur nasional dengan kegiatan positif yang bermanfaat, merekatkan hubungan sosial bermasyarakat, merenungkan nikmat kedamaian hidup berbangsa dan bertanah air.',
      dua1: {
        title: 'Doa Memohon Kedamaian Tanah Air',
        arabic: 'رَبِّ اجْعَلْ هَٰذَا بَلَدًا آمِنًا وَارْزُقْ أَهْلَهُ مِنَ الثَّمَرَاتِ.',
        transliteration: "Rabbij-'al hāżā baladan āminaw-warzuq ahlahū minas-tsamarāt.",
        translation: '“Wahai Tuhanku, jadikanlah negeri ini tempat tinggal yang aman sentosa, serta limpahkanlah rezeki dari buah-buahan yang mulia.”',
        fadhilah: 'Memelihara kerukunan bangsa di bawah naungan rahmat dan keamanan dari Allah SWT.'
      }
    };
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const checkEvents = (date: Date) => {
    const hijri = getHijriDate(date, true);
    const masehiKey = `${date.getDate()}-${date.getMonth() + 1}`;
    
    const islamic = ISLAMIC_EVENTS.filter(e => e.month === hijri.month && e.day === hijri.day);
    const national = NATIONAL_HOLIDAYS[masehiKey] || [];
    
    const allNames = [...islamic.map(e => e.name)];

    // 1. Senin dan Kamis (Setiap Pekan)
    if (date.getDay() === 1) {
      allNames.push('Puasa Sunnah Senin');
    } else if (date.getDay() === 4) {
      allNames.push('Puasa Sunnah Kamis');
    }

    // 2. Hari Jumat Sayyidul Ayyam (Setiap Pekan)
    if (date.getDay() === 5) {
      allNames.push('Hari Jumat Sayyidul Ayyam');
    }

    // 3. Rebo Wekasan (Rabu Terakhir Bulan Safar)
    if (date.getDay() === 3 && hijri.month === 2) {
      const nextWeek = new Date(date);
      nextWeek.setDate(date.getDate() + 7);
      const nextWeekHijri = getHijriDate(nextWeek, true);
      if (nextWeekHijri.month !== 2) {
        allNames.push('Tradisi Rebo Wekasan (Rabu Terakhir Bulan Safar)');
      }
    }

    // 4. 10 Hari Terakhir Ramadhan (Lailatul Qadar)
    if (hijri.month === 9 && hijri.day >= 21 && hijri.day <= 30) {
      allNames.push('10 Hari Terakhir Ramadhan (Lailatul Qadar)');
    }

    // 5. Yaumul Bidh (13, 14, 15 Setiap Bulan Hijriah, kecuali Ramadhan)
    if (hijri.month !== 9 && (hijri.day === 13 || hijri.day === 14 || hijri.day === 15)) {
      allNames.push(`Puasa Sunnah Yaumul Bidh (${hijri.day} ${hijri.monthName})`);
    }

    allNames.push(...national);
    const isHoliday = islamic.some(e => e.isHoliday) || national.length > 0;

    let dynamicCount = 0;
    if (date.getDay() === 1 || date.getDay() === 4) dynamicCount++;
    if (date.getDay() === 5) dynamicCount++;
    if (date.getDay() === 3 && hijri.month === 2) {
      const nextWeek = new Date(date);
      nextWeek.setDate(date.getDate() + 7);
      if (getHijriDate(nextWeek, true).month !== 2) {
        dynamicCount++;
      }
    }
    if (hijri.month === 9 && hijri.day >= 21 && hijri.day <= 30) dynamicCount++;
    if (hijri.month !== 9 && (hijri.day === 13 || hijri.day === 14 || hijri.day === 15)) dynamicCount++;
    
    return { allNames, isHoliday, islamicCount: islamic.length + dynamicCount };
  };

  // --- IMPROVED COUNTDOWN LOGIC ---
  const countdownInfo = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextEvent = null;
    let daysToEvent = 400;

    for (let i = 0; i < 366; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        
        const hijri = getHijriDate(checkDate, true);
        // Only countdown to Islamic Big Days
        const event = ISLAMIC_EVENTS.find(e => e.month === hijri.month && e.day === hijri.day);
        
        if (event) {
            nextEvent = event;
            daysToEvent = i;
            break;
        }
    }

    return { nextEvent, daysToEvent };
  }, []);

  const getHijriMonthRange = () => {
    const start = getHijriDate(new Date(year, month, 1), true);
    const end = getHijriDate(new Date(year, month, getDaysInMonth(year, month)), true);
    if (start.monthName === end.monthName) return `${start.monthName} ${start.yearStr}`;
    return `${start.monthName} - ${end.monthName} ${end.yearStr}`;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const blanks = Array.from({ length: startDay }, (_, i) => ({ day: prevMonthDays - startDay + i + 1, type: 'prev' }));
  const days = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, type: 'current' }));
  const totalSlots = blanks.length + days.length;
  const nextMonthFiller = Array.from({ length: (totalSlots > 35 ? 42 : 35) - totalSlots }, (_, i) => ({ day: i + 1, type: 'next' }));
  const allCalendarDays = [...blanks, ...days, ...nextMonthFiller];

  const holidaysInMonth = days.reduce((acc, { day }) => {
     const date = new Date(year, month, day);
     const ev = checkEvents(date);
     if (ev.allNames.length > 0) acc.push({ date, names: ev.allNames });
     return acc;
  }, [] as { date: Date, names: string[] }[]);

  const selectedHijri = getHijriDate(selectedDate, true);
  const selectedPasaran = getPasaran(selectedDate);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Multi-Layered Islamic Header Block */}
      <div className="relative overflow-hidden bg-[#e6ce9e] text-white pt-6 pb-20 px-5 rounded-b-[3.5rem] shadow-2xl z-10 transition-all duration-1000 border-b-4 border-santri-gold/30">
         
         {/* Layer 1: Background Geometric Pattern (Proper Rub el Hizb Segi 8 - Enlarged) */}
         <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23d4af37' stroke-width='1.8'%3E%3Crect x='30' y='30' width='60' height='60'/%3E%3Crect x='30' y='30' width='60' height='60' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
           backgroundSize: '120px 120px'
         }}></div>

         {/* Layer 2: Main Emerald Arch with Lattice Mesh */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[#004d00] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" style={{
               clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)'
            }}>
               {/* Proper Lattice Mesh Overlay (Detailed Segi 8 - Enlarged) */}
               <div className="absolute inset-0 opacity-15" style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='white' stroke-width='0.6'%3E%3Crect x='15' y='15' width='30' height='30'/%3E%3Crect x='15' y='15' width='30' height='30' transform='rotate(45 30 30)'/%3E%3C/g%3E%3C/svg%3E")`,
                 backgroundSize: '50px 50px'
               }}></div>
            </div>
            {/* Golden Border for Layer 2 */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
               <path d="M0,70 Q50,100 100,70" fill="none" stroke="#D4AF37" strokeWidth="2.5" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
               <path d="M0,72 Q50,102 100,72" fill="none" stroke="#fceabb" strokeWidth="0.5" opacity="0.4" />
            </svg>
         </div>

         {/* Layer 3: Central Nested Arch (Lighter Emerald) */}
         <div className="absolute inset-x-8 top-16 bottom-4 pointer-events-none">
            <div className="absolute inset-0 bg-[#006400] shadow-2xl rounded-t-[5rem] border-2 border-santri-gold/50" style={{
               clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)'
            }}></div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
               <path d="M0,85 Q50,100 100,85" fill="none" stroke="#f4c430" strokeWidth="1.5" />
            </svg>
         </div>

         <div className="relative z-20">
            <div className="flex justify-between items-start mb-2">
               <button onClick={() => navigate(-1)} className="p-2 bg-white/10 backdrop-blur-2xl rounded-xl hover:bg-white/20 transition-all active:scale-90 border border-white/20 shadow-2xl group">
                 <ArrowLeft size={18} className="text-santri-gold group-hover:-translate-x-1 transition-transform" />
               </button>
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
            
            <div className="flex flex-col items-center text-center">
               <h1 className="text-xl font-black leading-tight drop-shadow-2xl tracking-tighter text-white mb-1">
                  {DAYS_ID[selectedDate.getDay()]} {selectedPasaran}
                  <div className="text-sm font-bold opacity-90">{selectedDate.getDate()} {MONTHS_ID[selectedDate.getMonth()]} {selectedDate.getFullYear()}</div>
               </h1>
               
               <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-santri-gold/40 shadow-[inner_0_2px_10px_rgba(0,0,0,0.3)] group">
                  <Star size={14} className="text-santri-gold fill-santri-gold animate-pulse group-hover:rotate-45 transition-transform" />
                  <h2 className="text-white text-sm font-black tracking-widest drop-shadow-md">
                     {selectedHijri.day} {selectedHijri.monthName} {selectedHijri.yearStr}
                  </h2>
               </div>
               
               {/* COUNTDOWN SECTION */}
               {countdownInfo.nextEvent && (
                   <div className="mt-4 flex items-center justify-center gap-3 bg-[#004d00]/80 border border-santri-gold/30 rounded-2xl px-5 py-2 w-fit animate-in fade-in slide-in-from-bottom-8 duration-1000 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl group hover:scale-[1.02] transition-all">
                       <div className="p-2 bg-gradient-to-br from-santri-gold to-amber-600 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)] group-hover:rotate-12 transition-transform">
                          <Hourglass size={18} className="text-[#004d00] animate-spin-slow" />
                       </div>
                       <div className="flex flex-col items-start text-left">
                          <span className="text-[9px] uppercase font-black text-santri-gold tracking-[0.4em]">MOMENTUM BESAR</span>
                          <span className="text-xs font-bold tracking-tight text-white/90">
                              {countdownInfo.daysToEvent === 0 ? (
                                  `HARI INI: ${countdownInfo.nextEvent.name}`
                              ) : (
                                  `${countdownInfo.daysToEvent} Hari lagi ke ${countdownInfo.nextEvent.name}`
                              )}
                          </span>
                       </div>
                   </div>
               )}
            </div>
         </div>
      </div>

      <div className="px-4 -mt-14 relative z-20">
         <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{MONTHS_ID[month]} {year}</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{getHijriMonthRange()}</p>
               <div className="flex items-center justify-between w-full mt-4">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><ChevronLeft size={24} /></button>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GESER</span>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><ChevronRight size={24} /></button>
               </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
               {DAYS_ID.map((d, i) => (
                 <div key={d} className={`py-3 text-center text-[10px] font-bold ${i === 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{d}</div>
               ))}
            </div>

            <div className="grid grid-cols-7">
               {allCalendarDays.map((item, index) => {
                 let dateObj = item.type === 'current' ? new Date(year, month, item.day) : item.type === 'prev' ? new Date(year, month - 1, item.day) : new Date(year, month + 1, item.day);
                 const hijri = getHijriDate(dateObj, true);
                 const pasaran = getPasaran(dateObj);
                 const eventData = checkEvents(dateObj);
                 const isSunday = (index % 7) === 0;
                 const isRedDate = isSunday || eventData.isHoliday;
                 const isToday = dateObj.toDateString() === new Date().toDateString();
                 const isSelected = dateObj.toDateString() === selectedDate.toDateString();

                 return (
                   <button
                     key={index}
                     onClick={() => {
                        if (isRedDate) {
                           setModalDate(dateObj);
                           setModalEventNames(eventData.allNames.length > 0 ? eventData.allNames : ['Ahad']);
                           setEventModalOpen(true);
                        }
                        if (item.type === 'current') setSelectedDate(dateObj);
                        else if (item.type === 'prev') { handlePrevMonth(); setSelectedDate(dateObj); }
                        else { handleNextMonth(); setSelectedDate(dateObj); }
                     }}
                     className={`relative h-24 border-b border-r border-slate-100 dark:border-slate-800 transition-all ${item.type !== 'current' ? 'opacity-30' : 'bg-white dark:bg-slate-900'} ${isSelected ? 'bg-green-50 dark:bg-green-900/10 ring-2 ring-inset ring-santri-green' : ''} ${index % 7 === 6 ? 'border-r-0' : ''}`}
                   >
                      {/* Hijri Number - Top Left */}
                      <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold font-arabic ${isRedDate ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                         {toArabicNumerals(hijri.day)}
                      </span>

                      {/* Numeric Date - Center */}
                      <span className={`absolute top-[35%] left-1/2 -translate-x-1/2 text-xl font-black ${isRedDate ? 'text-red-500' : isToday ? 'text-santri-green' : 'text-slate-800 dark:text-slate-100'}`}>
                         {item.day}
                      </span>

                      {/* Pasaran - Bottom Center */}
                      <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-tighter ${isToday ? 'text-santri-green' : 'text-slate-400 dark:text-slate-500'}`}>
                         {pasaran}
                      </span>
                      
                      {/* Islamic Event Indicator */}
                      {eventData.islamicCount > 0 && (
                         <div className="absolute top-2 right-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-santri-gold shadow-sm animate-pulse"></div>
                         </div>
                      )}

                      {/* Indicator Today - Top Right */}
                      {isToday && (
                         <span className="w-1.5 h-1.5 rounded-full bg-santri-green absolute top-2 right-2 shadow-sm"></span>
                      )}
                   </button>
                 );
               })}
            </div>
         </div>
      </div>

      {/* Holiday List */}
      <div className="px-4 mt-6">
         <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-1 h-5 bg-santri-green rounded-full"></div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Hari Besar & Libur</h3>
         </div>
         <div className="space-y-3">
            {holidaysInMonth.length === 0 ? (
               <div className="text-center py-8 text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm italic">Tidak ada hari besar di bulan ini</div>
            ) : (
              holidaysInMonth.map((h, idx) => {
                 const ev = checkEvents(h.date);
                 return (
                    <div 
                       key={idx} 
                       onClick={() => {
                          setModalDate(h.date);
                          setModalEventNames(h.names);
                          setEventModalOpen(true);
                       }}
                       className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-l-4 border-l-red-500 border-y border-r border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group active:scale-98 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20"
                    >
                        <div className="text-center bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-xl min-w-[65px] border border-red-100 dark:border-red-900/30">
                           <span className="block text-[10px] font-black text-red-500 uppercase tracking-tighter">{MONTHS_ID[h.date.getMonth()].substring(0, 3)}</span>
                           <span className="block text-xl font-black text-red-600 leading-tight">{h.date.getDate()}</span>
                        </div>
                         <div className="flex-1">
                           {h.names.map((name, ni) => {
                             const isIslamic = ISLAMIC_EVENTS.some(ie => ie.name === name);
                             return (
                               <div key={ni} className="mb-2">
                                 <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                                   {isIslamic && <Star size={12} className="text-santri-gold fill-santri-gold" />}
                                   {name}
                                 </h4>
                                 
                               </div>
                             );
                           })}
                           <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/50 dark:border-slate-800/40">
                               <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  {DAYS_ID[h.date.getDay()]} {getPasaran(h.date)} • {getHijriDate(h.date, true).day} {getHijriDate(h.date, true).monthName}
                               </p>
                               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  Pelajari Selengkapnya <span className="text-[8px] transition-transform group-hover:translate-x-0.5">➔</span>
                               </span>
                            </div>
                        </div>
                    </div>
                 );
              })
            )}
         </div>
      </div>
      {/* Edu-Accordion Section */}
      <div className="px-4 mt-8 pb-8">
         <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-1 h-5 bg-santri-green rounded-full"></div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Panduan & Informasi Kalender</h3>
         </div>
         <div className="space-y-3">
            {/* Accordion Item 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300">
               <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 1 ? null : 1)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-850 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
               >
                  <div className="flex items-center gap-2.5">
                     <span className="text-base">📲</span>
                     <span>Panduan Penggunaan Fitur Kalender</span>
                  </div>
                  <ChevronDown 
                     size={16} 
                     className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${activeAccordion === 1 ? 'rotate-180' : ''}`} 
                  />
               </button>
               <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 1 ? 'max-h-[1000px] border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'}`}>
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                     <p>
                        Aplikasi <strong>Santri Modern</strong> ini menyematkan modul penanggalan terintegrasi dengan various fungsi interaktif untuk membantu rutinitas amaliyah dan ibadah sehari-hari:
                     </p>
                     <ul className="list-decimal pl-5 space-y-2">
                        <li>
                           <strong>Konverter Tanggal Interaktif:</strong> Ketuk pada tanggal apa saja di grid tampilan kalender utama. Panel informasi detail di bagian bawah akan langsung menghitung padanan tangal Hijriah yang akurat, lengkap dengan tanggal bulan Masehi dan <strong>Pasaran Jawa</strong> (Legi, Pahing, Pon, Wage, Kliwon) sesuai budaya pesantren Nusantara.
                        </li>
                        <li>
                           <strong>Deteksi Hari Mulia & Amaliyah Sunnah:</strong> Di bawah penanggalan, sistem akan secara cerdas menyoroti peristiwa keislaman terpenting yang jatuh pada bulan aktif tersebut (misalnya Isra' Mi'raj, Nisfu Sya'ban, permulaan Ramadhan, rincian hari besar Idul Fitri, Hari Asyura/Tasu'a, atau jadwal <strong>Fasting Days (Puasa Sunnah Ayyamul Bidh)</strong>).
                        </li>
                        <li>
                           <strong>Sistem Navigasi Cepat:</strong> Gunakan tombol panah kiri-kanan (<code>Chevron</code>) di sisi judul bulan di atas kartu kalender untuk melompat bulan atau tahun dengan cepat guna mendesain dan menjadwalkan agenda di masa mendatang.
                        </li>
                        <li>
                           <strong>Sinergi Kebutuhan Doa:</strong> Apabila Anda memiliki hajat mendesak, klik tombol pintasan kirim doa yang ada di layar ini agar permohonan spiritual Anda dipersiapkan dalam doa bersama keluarga besar santri.
                        </li>
                     </ul>
                  </div>
               </div>
            </div>

            {/* Accordion Item 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300">
               <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 2 ? null : 2)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
               >
                  <div className="flex items-center gap-2.5">
                     <span className="text-base">📜</span>
                     <span>Sejarah Kalender Hijriah & Landasan Syar'i</span>
                  </div>
                  <ChevronDown 
                     size={16} 
                     className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${activeAccordion === 2 ? 'rotate-180' : ''}`} 
                  />
               </button>
               <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 2 ? 'max-h-[1000px] border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'}`}>
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                     <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-emerald-500 p-3 rounded-r-xl mb-2">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-400 mb-1">Ketetapan Ilahi di Lauhul Mahfuzh</p>
                        <p className="italic">
                           "Sesungguhnya bilangan bulan pada sisi Allah adalah dua belas bulan, dalam ketetapan Allah di waktu Dia menciptakan langit dan bumi; di antaranya empat bulan haram. Itulah (ketetapan) agama yang lurus..."
                        </p>
                        <p className="text-[10px] text-right font-medium text-slate-500 dark:text-slate-400 mt-1">— QS. At-Tawbah: 36</p>
                     </div>
                     <p>
                        Sistem penanggalan Hijriah secara resmi diprakarsai oleh Khalifah kedua, <strong>Sayyidina Umar bin Khattab ra.</strong>, pada tahun ke-17 setelah Hijrah atas usulan dari Sayyidina Ali bin Abi Thalib ra. Momentum sejarah yang dijadikan tonggak awal perhitungan adalah peristiwa <strong>Hijrah Rasulullah SAW</strong> dari Makkah ke Madinah pada tahun 622 Masehi. Peristiwa agung ini dipilih karena melambangkan peralihan umat dari masa penuh penindasan menuju tegaknya kedaulatan dakwah dan tatanan sosial kemasyarakatan Islam yang madani.
                     </p>
                     <p>
                        Secara astronomis, kalender Hijriah dihitung berdasarkan <strong>Siklus Sinodis Bulan (Qomariyah)</strong>, yaitu peredaran Bulan mengelilingi Bumi secara penuh. Satu bulan Qomariyah menempuh waktu rata-rata 29 hari 12 jam 44 menit 2,8 detik (29,53059 hari). Sehingga dalam 1 tahun penuh, kalender Hijriah berjumlah <strong>354 atau 355 hari</strong>. Hal ini menyebabkan kalender Hijriah berkisar <strong>10 hingga 12 hari lebih pendek</strong> dibandingkan kalender Syamsiyah (Masehi) setiap tahunnya.
                     </p>
                  </div>
               </div>
            </div>

            {/* Accordion Item 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300">
               <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 3 ? null : 3)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-850 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
               >
                  <div className="flex items-center gap-2.5">
                     <span className="text-base">🔭</span>
                     <span>Ilmu Falak: Mengapa Tanggal Bisa Berbeda?</span>
                  </div>
                  <ChevronDown 
                     size={16} 
                     className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${activeAccordion === 3 ? 'rotate-180' : ''}`} 
                  />
               </button>
               <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 3 ? 'max-h-[1000px] border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'}`}>
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                     <div className="bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-500 p-3 rounded-r-xl mb-2">
                        <p className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Sabda Rasulullah SAW</p>
                        <p className="italic">
                           "Berpuasalah kamu karena melihat hilal dan berbukalah (berhari raya) karena melihatnya. Jika hilal tertutup awan bagimu, maka sempurnakanlah hitungan Sya'ban menjadi tiga puluh hari."
                        </p>
                        <p className="text-[10px] text-right font-medium text-slate-500 dark:text-slate-400 mt-1">— HR. Bukhari dan Muslim</p>
                     </div>
                     <p>
                        Jika Anda mengecek kalender Hijriah di media atau aplikasi lain, terkadang ditemukan selisih tanggal sekitar 1 atau 2 hari. Perbedaan ini wajar terjadi dalam khazanah ijtihad fiqih kontemporer dan ilmu falak akibat perbedaan metode:
                     </p>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>
                           <strong>Rukyatul Hilal:</strong> Penentuan fisik mata telanjang dengan bantuan teleskop pada hari ke-29 bulan berjalan. Jika hilal terlihat pasca terbenam matahari, maka petang itu langsung memasuk tanggal 1 bulan baru.
                        </li>
                        <li>
                           <strong>Hisab Hakiki:</strong> Perhitungan matematis murni posisi benda langit untuk memproyeksikan hilal di atas ufuk tanpa keharusan observasi mata.
                        </li>
                        <li>
                           <strong>Kebijakan Imkanur Rukyat (MABIMS):</strong> Standar menteri agama regional Asia Tenggara mensyaratkan hilal minimal berada di ketinggian <strong>3 derajat</strong> dan sudut elongasi bumi-bulan minimal <strong>6,4 derajat</strong> untuk dianggap sah dan dapat dilihat. Perbedaan kriteria inilah yang menyebabkan variasi penetapan hari raya maupun awal bulan Hijriah di tengah masyarakat Muslim. Selama selisih tidak melebihi 2 hari, semuanya berlandaskan dalil yang kuat dan valid dijadikan acuan ibadah.
                        </li>
                     </ul>
                  </div>
               </div>
            </div>

            {/* Accordion Item 4 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300">
               <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 4 ? null : 4)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
               >
                  <div className="flex items-center gap-2.5">
                     <span className="text-base">📅</span>
                     <span>Nama Bulan Hijriah & Bulan Mulia</span>
                  </div>
                  <ChevronDown 
                     size={16} 
                     className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${activeAccordion === 4 ? 'rotate-180' : ''}`} 
                  />
               </button>
               <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 4 ? 'max-h-[1500px] border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'}`}>
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                     <p className="mb-2">
                        Dalam siklus tahunan, terdapat 4 bulan haram (suci/mulia yaitu <strong>Zulkaidah, Zulhijah, Muharam, dan Rajab</strong>) di mana amal ibadah dilipatkan pahalanya dan dilarang keras melalukan perbuatan zalim.
                     </p>
                     <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60 mb-4">
                        <table className="w-full text-left text-[11px] border-collapse min-w-[280px]">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60">
                                 <th className="p-2 font-bold text-center w-8">No</th>
                                 <th className="p-2 font-bold">Bulan Islam</th>
                                 <th className="p-2 font-bold">Latin Arab</th>
                                 <th className="p-2 font-bold text-right font-arabic">Arab</th>
                                 <th className="p-2 font-bold text-center">Hari</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                              {[
                                 { no: 1, name: 'Muharam 🌟', latin: 'Al-Muḥarram', arab: 'المحرم', days: '30' },
                                 { no: 2, name: 'Safar', latin: 'Shafar', arab: 'صفر', days: '29' },
                                 { no: 3, name: 'Rabiul awal 💚', latin: 'Rabī‘ul Awwal', arab: 'ربيع الأول', days: '30' },
                                 { no: 4, name: 'Rabiul akhir', latin: 'Rabī‘ust Tsānī', arab: 'ربiec الثاني', days: '29' },
                                 { no: 5, name: 'Jumadil awal', latin: 'Jumādal Ūlā', arab: 'جمادي الأولي', days: '30' },
                                 { no: 6, name: 'Jumadil akhir', latin: 'Jumādal Ākhirah', arab: 'جمadi الأخرة', days: '29' },
                                 { no: 7, name: 'Rajab 🌟', latin: 'Rajab', arab: 'رجب', days: '30' },
                                 { no: 8, name: 'Syakban', latin: 'Sya‘bān', arab: 'شعبان', days: '29' },
                                 { no: 9, name: 'Ramadan 🌙', latin: 'Ramadlān', arab: 'رمضان', days: '30' },
                                 { no: 10, name: 'Syawal', latin: 'Syawwāl', arab: 'شوال', days: '29' },
                                 { no: 11, name: 'Zulkaidah 🌟', latin: 'Dzul Qa‘dah', arab: 'ذo القعدة', days: '30' },
                                 { no: 12, name: 'Zulhijah 🌟', latin: 'Dzul Ḥijjah', arab: 'ذو الحجة', days: '29/(30)' },
                              ].map((b) => (
                                 <tr key={b.no} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="p-2 text-center text-slate-500">{b.no}</td>
                                    <td className="p-2 font-semibold text-slate-800 dark:text-slate-100">{b.name}</td>
                                    <td className="p-2 text-slate-500 italic text-[10px]">{b.latin}</td>
                                    <td className="p-2 text-right font-arabic font-medium text-slate-950 dark:text-white text-xs">{b.arab}</td>
                                    <td className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">{b.days}</td>
                                 </tr>
                              ))}
                              <tr className="bg-slate-50/70 dark:bg-slate-800/30 font-semibold border-t border-slate-200 dark:border-slate-700">
                                 <td colSpan={4} className="p-2 text-right font-bold text-slate-800 dark:text-slate-100">Total</td>
                                 <td className="p-2 text-center font-black text-slate-900 dark:text-white">354/(355)</td>
                              </tr>
                           </tbody>
                        </table>
                      </div>
                      <span className="text-[10px] text-slate-400">Keterangan: (🌟) melambangkan Al-Asyhurul Hurum (Bulan Suci Mulia), (🌙) Bulan Suci Puasa Ramadhan, (💚) Bulan kelahiran Nabi SAW.</span>
                   </div>
                </div>
             </div>

             {/* Accordion Item 5 */}
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-305">
                <button
                   type="button"
                   onClick={() => setActiveAccordion(activeAccordion === 5 ? null : 5)}
                   className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                   <div className="flex items-center gap-2.5">
                      <span className="text-base">☀️</span>
                      <span>Hari Hijriah & Pergantian Waktu</span>
                   </div>
                   <ChevronDown 
                      size={16} 
                      className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${activeAccordion === 5 ? 'rotate-180' : ''}`} 
                   />
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 5 ? 'max-h-[1000px] border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'}`}>
                   <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                      <p>
                         Berbeda dengan penanggalan masehi yang mengawali hari baru tepat pada tengah malam (pukul 24:00 dini hari), <strong>kalender Hijriah mereset pergantian hari bertepatan dengan tenggelamnya matahari di ufuk barat (Masuk waktu shalat Maghrib)</strong>. Inilah sebabnya tradisi Yasinan, Tahlilan, atau malam takbiran Idul Fitri senantiasa dilaksanakan pada malam sebelum hari H di hitungan masehi.
                      </p>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60">
                         <table className="w-full text-left text-[11px] border-collapse min-w-[280px]">
                            <thead>
                               <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60">
                                  <th className="p-2 font-bold">Nama Hari</th>
                                  <th className="p-2 font-bold">Latin Arab</th>
                                  <th className="p-2 font-bold text-right font-arabic">Arab</th>
                                  <th className="p-2 font-bold text-center">Artinya</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                               {[
                                  { key: 'Ahad', name: 'Minggu', latin: 'al-Aḥad', arab: 'الأحد', meaning: 'Pertama' },
                                  { key: 'Senin', name: 'Senin', latin: 'al-Itsnain', arab: 'الإثنين', meaning: 'Kedua' },
                                  { key: 'Selasa', name: 'Selasa', latin: 'ats-Tsulātsā’', arab: 'الثلاثاء', meaning: 'Ketiga' },
                                  { key: 'Rabu', name: 'Rabu', latin: 'al-Arbi‘ā’', arab: 'الأربعاء', meaning: 'Keempat' },
                                  { key: 'Kamis', name: 'Kamis', latin: 'al-Khamīs', arab: 'الخميس', meaning: 'Kelima' },
                                  { key: 'Jumat', name: 'Jumat ✨', latin: 'aj-Jumu‘ah', arab: 'الجمعة', meaning: 'Perkumpulan' },
                                  { key: 'Sabtu', name: 'Sabtu', latin: 'as-Sabt', arab: 'السبت', meaning: 'Istirahat / Berhenti' },
                               ].map((h) => (
                                  <tr key={h.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                     <td className="p-2 font-semibold text-slate-800 dark:text-slate-100">{h.name}</td>
                                     <td className="p-2 italic text-slate-500 text-[10px]">{h.latin}</td>
                                     <td className="p-2 text-right font-arabic font-medium text-slate-950 dark:text-white text-xs">{h.arab}</td>
                                     <td className="p-2 text-center text-slate-600 dark:text-slate-400 font-medium">{h.meaning}</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                      <p className="text-[10px] text-slate-400 shrink-0">✨ Hari Jumat merupakan Sayyidul Ayyam (pemimpin segala hari) yang dipenuhi amalan mulia serta memiliki satu mustajab untuk mengabulkan semua untaian doa hamba-Nya.</p>

                      {/* --- START OF CALENDAR DAY DETAIL POPUP MODAL --- */}
                      {eventModalOpen && modalDate && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                          <div 
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                              <div>
                                <span className="text-[11px] uppercase font-black tracking-widest text-[#004d00] dark:text-emerald-400 block mb-0.5">DETAIL HARI BESAR & LIBUR</span>
                                <h3 className="text-base font-black leading-tight text-slate-900 dark:text-slate-100">
                                  {DAYS_ID[modalDate.getDay()]}, {modalDate.getDate()} {MONTHS_ID[modalDate.getMonth()]} {modalDate.getFullYear()}
                                </h3>
                                <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                  {getPasaran(modalDate)} • {getHijriDate(modalDate, true).day} {getHijriDate(modalDate, true).monthName} {getHijriDate(modalDate, true).yearStr} H
                                </p>
                              </div>
                              <button 
                                onClick={() => setEventModalOpen(false)} 
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </div>

                            {/* Modal Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                              {modalEventNames.map((name, idx2) => {
                                const info = getEventDetailInfo(name, modalDate);
                                const isIslamic = info.category === 'islamic';
                                const isSundayObj = info.category === 'sunday';

                                return (
                                  <div key={idx2} className="space-y-4">
                                    {/* Event Title Badge */}
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-xl ${isIslamic ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' : isSundayObj ? 'bg-red-50 text-red-500 dark:bg-red-950/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-950/20'}`}>
                                        {isIslamic ? <Star size={18} className="fill-current text-amber-500" /> : isSundayObj ? <Heart size={18} className="fill-current" /> : <Info size={18} />}
                                      </div>
                                      <div>
                                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                          {info.title}
                                        </h4>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                          {isIslamic ? 'KALENDER AGAMA' : isSundayObj ? 'HARI MINGGU / KELUARGA' : 'HARI BESAR NASIONAL'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Kisah & Sejarah */}
                                    <div className="space-y-2.5 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                                        <BookOpen size={12} /> Sejarah & Kisah Lengkap
                                      </h5>
                                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed text-justify">
                                        {info.history}
                                      </p>
                                      <button
                                        onClick={() => {
                                          setEventModalOpen(false);
                                          const q = name.toLowerCase();
                                          if (q.includes('isra') || q.includes('mi\'raj')) {
                                            navigate('/islamic-history-detail', { state: { id: 'isra-miraj' } });
                                          } else if (q.includes('maulid')) {
                                            navigate('/islamic-history-detail', { state: { id: 'maulid-nabi' } });
                                          } else {
                                            navigate('/islamic-history-detail', { 
                                              state: { 
                                                query: `Kisah dan sejarah lengkap tentang ${name} beserta tokoh, alur kronologi, dan hikmahnya secara mendalam.` 
                                              } 
                                            });
                                          }
                                        }}
                                        className="mt-2 w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-[#004d00] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-emerald-100 dark:border-emerald-900/30 active:scale-98 shadow-sm"
                                      >
                                        <span>📖</span> Pelajari Kisah Lengkap
                                      </button>
                                    </div>

                                    {/* Amalan Utama */}
                                    {info.amalan && (
                                      <div className="space-y-1.5 bg-emerald-500/5 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-800/20">
                                        <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                          <Sparkles size={12} /> Anjuran Amalan Utama
                                        </h5>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                          {info.amalan}
                                        </p>
                                      </div>
                                    )}

                                    {/* Prayers / Doa (If any) */}
                                    {info.dua1 && (
                                      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                                          <h6 className="text-xs font-black text-amber-850 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                                            <Sparkles size={13} className="text-amber-500" /> {info.dua1.title}
                                          </h6>
                                          <div className="w-full text-right font-arabic leading-loose text-emerald-800 dark:text-emerald-300 text-lg sm:text-xl font-medium tracking-wide">
                                            {info.dua1.arabic}
                                          </div>
                                          <div className="text-[11.5px] font-medium text-slate-600 dark:text-slate-400 italic pl-3 border-l-2 border-amber-300">
                                            {info.dua1.transliteration}
                                          </div>
                                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-orange-100 dark:border-slate-800">
                                            <strong>Artinya:</strong> {info.dua1.translation}
                                          </div>
                                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-start gap-1 p-1">
                                            <span>💡</span>
                                            <span><strong>Fadhilah:</strong> {info.dua1.fadhilah}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {info.dua2 && (
                                      <div className="space-y-4">
                                        <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                                          <h6 className="text-xs font-black text-amber-850 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                                            <Sparkles size={13} className="text-amber-500" /> {info.dua2.title}
                                          </h6>
                                          <div className="w-full text-right font-arabic leading-loose text-emerald-800 dark:text-emerald-300 text-lg sm:text-xl font-medium tracking-wide">
                                            {info.dua2.arabic}
                                          </div>
                                          <div className="text-[11.5px] font-medium text-slate-600 dark:text-slate-400 italic pl-3 border-l-2 border-amber-300">
                                            {info.dua2.transliteration}
                                          </div>
                                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-orange-100 dark:border-slate-800">
                                            <strong>Artinya:</strong> {info.dua2.translation}
                                          </div>
                                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-start gap-1 p-1">
                                            <span>💡</span>
                                            <span><strong>Fadhilah:</strong> {info.dua2.fadhilah}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex gap-3">
                              <button 
                                onClick={() => setEventModalOpen(false)}
                                className="flex-1 py-3 text-center text-xs font-black bg-[#004d00] dark:bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 rounded-xl shadow-md active:scale-98 transition-all uppercase tracking-widest"
                              >
                                Tutup Detail
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* --- END OF CALENDAR DAY DETAIL POPUP MODAL --- */}
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CalendarScreen;