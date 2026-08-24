import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, BookOpen, HeartPulse, Brain, 
  Loader2, MessageSquare, Scroll, 
  Gem, UserCheck, Flame, Send, ChevronDown,
  Copy, Share2, Check, Sparkles, RefreshCw, 
  Type, ArrowUpRight, History, Trash2,
  Moon, Sun, Sunrise, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askReligiousQuery } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { deductWasilahForAI } from '../services/firebase';

interface KhutbahHistoryItem {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
}

interface SunnahItem {
  id: number;
  period: 'Malam Jumat (Kamis Maghrib - Subuh)' | 'Pagi & Siang Hari Jumat' | 'Sore Hari (Ba\'da Ashar - Maghrib)';
  periodBadge: string;
  title: string;
  desc: string;
  icon: any;
  arabicText?: string;
  latinText?: string;
  translation?: string;
  tataCara: string[];
  fadhilah: string;
  quranHadith: string;
}

const FRIDAY_SUNNAHS: SunnahItem[] = [
  { 
    id: 1, 
    period: 'Malam Jumat (Kamis Maghrib - Subuh)',
    periodBadge: 'Malam Jumat',
    title: 'Membaca Surah Yasin (Rutinan Malam Jumat)', 
    desc: 'Amaliah istiqamah tradisi Ahlussunnah wal Jama\'ah di Nusantara pada Kamis malam ba\'da Maghrib/Isya. Bertujuan mendekatkan diri kepada Allah SWT, memohon keberkahan umur, pengampunan dosa, serta menghadiahkan pahala bacaan bagi orang tua dan para leluhur.', 
    icon: Moon,
    tataCara: [
      'Menyiapkan diri dalam keadaan suci dari hadas kecil dan besar serta memakai wewangian / pakaian rapi.',
      'Diawali membaca Tawasul / Hadrah Fatihah yang ditujukan kepada Rasulullah SAW, para Nabi, keluarga, sahabat, 4 Imam Madzhab, para Wali Sanga, Syeikh Abdul Qadir Al-Jilani, serta khusus kepada kedua orang tua, guru-guru, dan ahli kubur kaum muslimin.',
      'Membaca Surah Yasin (83 Ayat) secara tartil dengan merenungi makna kekuasaan Allah SWT, kabar gembira bagi hamba yang beriman, serta pengingat kehidupan akhirat.',
      'Membaca Doa Khusus Surah Yasin (Doa Yasin Syar\'i) untuk memohon keselamatan panca indera, perlindungan dari wabah dan fitnah, serta kelapangan hajat duniawi dan ukhrawi.',
      'Membaca Tahlil singkat dan Istighfar bersama keluarga atau jamaah majlis taklim.'
    ],
    fadhilah: 'Para ulama menjelaskan bahwa orang yang membaca Surah Yasin di malam Jumat dengan rasa ikhlas dan ketulusan hati akan mendapati dosanya diampuni pada waktu Subuh. Selain itu, bacaan ini menjadi perantara dikabulkannya hajat-hajat mendesak, menerangi alam kubur orang tua dan kerabat yang telah mendahului, serta memberikan ketenangan jiwa sepanjang pekan.',
    quranHadith: 'Rasulullah SAW bersabda: "Barangsiapa membaca Surah Yasin pada malam Jumat karena mengharapkan rida Allah SWT, maka diampuni dosa-dosanya pada pagi harinya." (HR. Al-Baihaqi dalam Syu\'abul Iman, Imam As-Suyuthi dalam Al-Jami\' As-Shaghir).'
  },
  { 
    id: 2, 
    period: 'Malam Jumat (Kamis Maghrib - Subuh)',
    periodBadge: 'Malam Jumat',
    title: 'Membaca Surah Al-Kahfi (110 Ayat)', 
    desc: 'Amalan sunnah muakkadah yang dianjurkan untuk dibaca secara menyeluruh sejak terbenamnya matahari pada hari Kamis sore hingga terbenamnya matahari pada hari Jumat sore.', 
    icon: BookOpen,
    tataCara: [
      'Waktu Pelaksanaan: Fleksibel, bisa dibaca sekaligus pada Kamis malam setelah Maghrib/Isya, atau dicicil dalam empat bagian (seperti seperempat bagian setelah Subuh, setelah Jumat, dan sebelum Maghrib).',
      'Disunnahkan tadabbur membaca terjemahan atau tafsirnya karena Surah Al-Kahfi memuat 4 kisah besar: Pemuda Ashabul Kahfi (ujian iman), Pemilik Dua Kebun (ujian harta), Nabi Musa & Khidir (ujian ilmu), serta Zulkarnain (ujian kekuasaan).',
      'Dianjurkan menghafal dan mencermati 10 ayat pertama (Ayat 1-10) serta 10 ayat terakhir (Ayat 101-110) sebagai benteng pertahanan spiritual.'
    ],
    fadhilah: 'Allah SWT akan memancarkan cahaya (nur) penerang yang membentang dari bawah telapak kakinya hingga menembus langit pada hari kiamat, serta menerangi jalannya di antara dua Jumat. Di samping itu, pembaca Al-Kahfi dijamin perlindungan dari fitnah terbesar akhir zaman, yaitu fitnah Al-Masih Ad-Dajjal.',
    quranHadith: 'Rasulullah SAW bersabda: "Barangsiapa membaca surah Al-Kahfi pada malam Jumat atau hari Jumat, niscaya ia akan diterangi cahaya di antara dirinya dan Ka\'bah (serta di antara dua Jumat)." (HR. Al-Hakim & Al-Baihaqi, dishahihkan oleh Al-Albani).'
  },
  { 
    id: 3, 
    period: 'Malam Jumat (Kamis Maghrib - Subuh)',
    periodBadge: 'Malam Jumat',
    title: 'Memperbanyak Bacaan Shalawat Nabi', 
    desc: 'Anjuran istimewa dari Rasulullah SAW untuk memperbanyak ucapan shalawat dan salam atas baginda Nabi Muhammad SAW sepanjang Kamis malam hingga akhir Jumat.', 
    icon: MessageSquare,
    arabicText: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَنَبِيِّكَ وَرَسُولِكَ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
    latinText: 'Allahumma shalli \'ala sayyidina Muhammadin \'abdika wa nabiyyika wa rasulikan-nabiyyil ummiyyi wa \'ala alihi wa shahbihi wa sallim.',
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, hamba-Mu, Nabi-Mu, dan Rasul-Mu yang ummi, serta kepada keluarga dan sahabatnya.',
    tataCara: [
      'Memilih lafaz shalawat yang afdhal, seperti Shalawat Ummi (paling utama di hari Jumat), Shalawat Ibrahimiyah, Shalawat Nariyah, Shalawat Munjiyat, atau Shalawat Thibbils Qulub.',
      'Membaca sekurang-kurangnya 100 kali, 300 kali, hingga 1.000 kali atau sebanyak-banyaknya tanpa batas.',
      'Diresapi dengan rasa rindu (syauq) dan kecintaan mendalam kepada Nabi Muhammad SAW serta niat mengharapkan syafaat kelak di Padang Mahsyar.'
    ],
    fadhilah: 'Mendapatkan 10 kali rahmat dan keberkahan dari Allah SWT untuk tiap 1 kali shalawat, dihapuskan 10 keburukan, ditinggikan 10 derajat, serta malaikat akan menyampaikan secara langsung nama pembacanya kepada Rasulullah SAW di alam barzakh.',
    quranHadith: 'Rasulullah SAW bersabda: "Perbanyaklah membaca shalawat kepadaku pada hari Jumat dan malam Jumat, karena shalawat kalian diperlihatkan kepadaku. Barangsiapa yang paling banyak bershalawat kepadaku, dialah yang paling dekat kedudukannya denganku di hari kiamat." (HR. Al-Baihaqi).'
  },
  { 
    id: 4, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Persiapan Jumat',
    title: 'Mandi Sunnah Jumat (Ghusl al-Jumu\'ah)', 
    desc: 'Mandi bersuci yang hukumnya Sunnah Muakkadah (sangat dianjurkan) bagi setiap muslim laki-laki yang hendak menghadiri Shalat Jumat demi menjaga kebersihan fisik dan kesucian spiritual.', 
    icon: Flame,
    arabicText: 'نَوَيْتُ الْغُسْلَ لِيَوْمِ الْجُمُعَةِ سُنَّةً لِلَّهِ تَعَالَى',
    latinText: 'Nawaitul ghusla liyaumil jumu\'ati sunnatan lillahi ta\'ala.',
    translation: 'Saya berniat mandi sunnah pada hari Jumat karena Allah Ta\'ala.',
    tataCara: [
      'Waktu Mandi: Dimulai sejak terbit fajar shadiq (waktu Subuh) hari Jumat hingga sebelum berangkat menuju masjid (paling utama dilakukan mendekati waktu berangkat).',
      'Membaca niat mandi Jumat secara lisan dan di dalam hati bersamaan dengan guyuran air pertama ke kepala.',
      'Mencuci kedua tangan 3 kali, membersihkan kotoran/najis pada bagian lipatan tubuh dan kemaluan.',
      'Berwudhu secara sempurna sebagaimana wudhu untuk shalat.',
      'Menyiramkan air ke atas kepala sebanyak 3 kali hingga membasahi sela-sela rambut dan kulit kepala.',
      'Menyiramkan air ke seluruh tubuh bagian kanan (dari pundak hingga kaki), kemudian bagian kiri, serta menggosok lipatan badan hingga bersih merata.'
    ],
    fadhilah: 'Menghapuskan dosa-dosa kecil yang mengalir bersama tetesan air mandi, memberikan kesegaran fisik, menghilangkan bau badan yang mengganggu, serta mendatangkan ketenangan bagi orang-orang yang berada di sekitarnya saat berada dalam shaf masjid.',
    quranHadith: 'Rasulullah SAW bersabda: "Mandi pada hari Jumat adalah kewajiban (sunnah yang sangat ditekankan) bagi setiap orang yang telah baligh, serta memakai siwak dan menyentuh minyak wangi jika memilikinya." (HR. Bukhari & Muslim).'
  },
  { 
    id: 5, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Persiapan Jumat',
    title: 'Memotong Kuku & Merapikan Anggota Badan', 
    desc: 'Anjuran kebersihan fitrah manusia dengan memotong kuku, merapikan kumis, mencukur bulu ketiak dan kemaluan sebelum berangkat shalat Jumat.', 
    icon: UserCheck,
    arabicText: 'بِسْمِ اللهِ وَبِاللهِ وَعَلَى سُنَّةِ مُحَمَّدٍ وَآلِ مُحَمَّدٍ',
    latinText: 'Bismillahi wa billahi wa \'ala sunnati Muhammadin wa ali Muhammad.',
    translation: 'Dengan nama Allah dan demi Allah, serta mengikuti sunnah Nabi Muhammad dan keluarga Nabi Muhammad.',
    tataCara: [
      'Urutan Memotong Kuku Tangan (Kitab Al-Majmu\' karangan Imam An-Nawawi Madzhab Syafi\'i):',
      '1. Tangan Kanan: Dimulai dari Jari Telunjuk -> Jari Tengah -> Jari Manis -> Jari Kelingking -> diakhiri Jari Jempol.',
      '2. Tangan Kiri: Dimulai dari Jari Kelingking -> Jari Manis -> Jari Tengah -> Jari Telunjuk -> diakhiri Jari Jempol.',
      'Urutan Memotong Kuku Kaki: Dimulai dari jari kelingking kaki kanan secara berurutan menuju jempol kanan, lalu dilanjutkan dari jempol kaki kiri secara berurutan menuju kelingking kaki kiri.',
      'Merapikan kumis agar tidak menutupi bibir, mencukur bulu ketiak dan bulu kemaluan.',
      'Sunnah menguburkan potongan kuku dan sisa rambut ke dalam tanah sebagai penghormatan terhadap bagian tubuh manusia.'
    ],
    fadhilah: 'Terhindar dari kuman dan kotoran penyakit yang bersarang di sela kuku, menjalankan fitrah para Nabi dan Rasul, serta mendatangkan kebersihan lahiriah yang melapangkan pintu rizki.',
    quranHadith: 'Diriwayatkan dari Ibnu Umar RA: "Bahwasanya Nabi Muhammad SAW selalu memotong kuku dan mencukur kumisnya pada hari Jumat sebelum beliau keluar menuju shalat Jumat." (HR. Al-Baihaqi).'
  },
  { 
    id: 6, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Persiapan Jumat',
    title: 'Memakai Pakaian Terbaik (Diutamakan Berwarna Putih)', 
    desc: 'Disunnahkan mengenakan busana yang paling bersih, rapi, dan indah yang dimiliki, serta mengutamakan warna putih sebagai warna kebanggaan Islam.', 
    icon: Gem,
    arabicText: 'اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا هُوَ لَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا هُوَ لَهُ',
    latinText: 'Allahumma inni as-aluka min khairihi wa khairi ma huwa lahu, wa a\'udzu bika min syarrihi wa syarri ma huwa lahu.',
    translation: 'Ya Allah, aku memohon kepada-Mu kebaikan pakaian ini dan kebaikan yang ada padanya, dan aku berlindung kepada-Mu dari keburukannya dan keburukan yang ada padanya.',
    tataCara: [
      'Memilih pakaian yang paling bersih, rapi, sudah disetrika, dan tidak bernoda.',
      'Mengutamakan busana berwarna putih (seperti baju koko putih, jubah putih, atau sarung putih bersih).',
      'Mendahulukan anggota tubuh sebelah kanan saat memasukkan tangan atau kaki ke pakaian.',
      'Membaca doa memakai pakaian di atas dengan niat mengagungkan hari Jumat sebagai hari raya mingguan (Sayyidul Ayyam).'
    ],
    fadhilah: 'Mencerminkan keagungan syiar Islam, menghormati malaikat dan jamaah shalat Jumat, serta mendapatkan nilai pahala ibadah mengagungkan perayaan Islam.',
    quranHadith: 'Rasulullah SAW bersabda: "Pakailah pakaian kalian yang berwarna putih, karena pakaian putih adalah sebaik-baik pakaian kalian, dan kafanilah jenazah kalian dengannya." (HR. Abu Dawud, At-Tirmidzi, & Ibn Majah).'
  },
  { 
    id: 7, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Persiapan Jumat',
    title: 'Memakai Wangi-Wangian (Parfum Non-Alkohol)', 
    desc: 'Disunnahkan secara khusus bagi laki-laki untuk mengoleskan wewangian harum pada pakaian dan tubuh sebelum menuju ke masjid.', 
    icon: HeartPulse,
    tataCara: [
      'Memilih jenis minyak wangi yang harum dan bebas alkohol (seperti minyak kasturi, gaharu, atau wewangian segar lainnya).',
      'Mengoleskan secukupnya pada titik-titik nadi: pergelangan tangan, leher, belakang telinga, serta ujung pakaian luar.',
      'Berniat mengikuti sunnah Rasulullah SAW yang sangat menyukai wewangian dan kebersihan.'
    ],
    fadhilah: 'Membuat aroma tubuh menjadi harum dan segar, menciptakan kenyamanan serta kekhusyukan bagi jamaah di sekeliling, dan disukai oleh para malaikat rahmat yang hadir di masjid.',
    quranHadith: 'Rasulullah SAW bersabda: "Hendaklah setiap muslim mandi pada hari Jumat, memakai pakaian terbaiknya, dan jika ia memiliki minyak wangi, hendaklah ia mengoleskannya." (HR. Ahmad & Bukhari).'
  },
  { 
    id: 8, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Perjalanan ke Masjid',
    title: 'Bersegera ke Masjid (Al-Ibtikar) & Doa Perjalanan', 
    desc: 'Anjuran berangkat lebih awal ke masjid sebelum azan berkumandang atau sebelum khatib naik ke atas mimbar.', 
    icon: Sunrise,
    arabicText: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ يَسَارِي نُورًا، وَفَوْقِي نُورًا، وَتَحْتِي نُورًا، وَأَمَامِي نُورًا، وَخَلْفِي نُورًا، وَاجْعَلْ لِي نُورًا',
    latinText: 'Allahummaj\'al fii qalbii nuuran, wa fii basharii nuuran, wa fii sam\'ii nuuran, wa \'an yamiinii nuuran, wa \'an yasaarii nuuran, wa fauqii nuuran, wa tahtii nuuran, wa amamii nuuran, wa khalfii nuuran, waj\'al lii nuuran.',
    translation: 'Ya Allah, jadikanlah di dalam hatiku cahaya, pada penglihatanku cahaya, pada pendengaranku cahaya, dari kananku cahaya, dari kiriku cahaya, dari atasku cahaya, dari bawahku cahaya, dari depanku cahaya, dari belakangku cahaya, dan jadikanlah untukku cahaya.',
    tataCara: [
      'Melangkah keluar rumah dengan tenang, tidak berlari atau tergesa-gesa meskipun waktu sudah mendekati khutbah.',
      'Membaca Doa Menuju Masjid di atas sepanjang perjalanan.',
      'Disunnahkan berjalan kaki menuju masjid jika jaraknya memungkinkan, karena setiap langkah kaki bernilai pahala dan penghapus dosa.',
      'Masuk ke dalam masjid dan segera mengisi shaf paling depan yang masih kosong.'
    ],
    fadhilah: 'Para malaikat berdiri di pintu-pintu masjid mencatat nama-nama jamaah yang datang secara berurutan. Orang yang datang pada jam pertama diibaratkan berkurban seekor unta, jam kedua seekor sapi, jam ketiga seekor domba, jam keempat seekor ayam, dan jam kelima sebutir telur.',
    quranHadith: 'Rasulullah SAW bersabda: "Apabila hari Jumat tiba, para malaikat berdiri di pintu masjid mencatat orang yang datang pertama, kemudian berikutnya. Apabila imam telah duduk di mimbar, lembaran catatan ditutup dan mereka mendengarkan khutbah." (HR. Bukhari & Muslim).'
  },
  { 
    id: 9, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Di Dalam Masjid',
    title: 'Adab di Masjid & Menyimak Khutbah', 
    desc: 'Tata tertib syar\'i saat berada di dalam masjid, melaksanakan shalat sunnah, dan kewajiban mendengarkan khutbah dengan tenang.', 
    icon: Clock,
    arabicText: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latinText: 'Allahummaftah lii abwaaba rahmatik.',
    translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    tataCara: [
      'Melangkah masuk masjid dengan mendahulukan Kaki Kanan sambil membaca Doa Masuk Masjid di atas.',
      'Mengerjakan Shalat Sunnah Tahiyyatul Masjid 2 rakaat sebelum duduk.',
      'Mengerjakan Shalat Sunnah Qabliyah Jumat 2 atau 4 rakaat.',
      'Tidak melangkahi pundak jamaah yang sudah duduk (Dilarang \'It-tikya\') dan tidak memisahkan dua orang yang duduk berdampingan.',
      'Saat Khatib naik mimbar dan mengucapkan salam: WAJIB DIAM (Al-Inshat), tidak berbicara, tidak menegur orang lain dengan suara, tidak memegang HP, dan menyimak materi khutbah dengan penuh khusyuk.'
    ],
    fadhilah: 'Diampuni dosa-dosanya antara Jumat tersebut hingga Jumat berikutnya, ditambah bonus 3 hari (total 10 hari pahala kebaikan).',
    quranHadith: 'Rasulullah SAW bersabda: "Barangsiapa mandi lalu mendatangi shalat Jumat, kemudian shalat sunnah sekuasanya, lalu diam mendengarkan khutbah hingga selesai, kemudian shalat bersama imam, maka diampuni dosanya antara Jumat itu dan Jumat berikutnya ditambah tiga hari." (HR. Muslim).'
  },
  { 
    id: 10, 
    period: 'Pagi & Siang Hari Jumat',
    periodBadge: 'Setelah Shalat',
    title: 'Shalat Sunnah Ba\'diyyah & Doa Keluar Masjid', 
    desc: 'Mengerjakan shalat sunnah sesudah shalat Jumat serta berdoa ketika melangkahkan kaki keluar dari masjid.', 
    icon: Sun,
    arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ وَرَحْمَتِكَ فَإِنَّهُ لاَ يَمْلِكُهَا إِلاَّ أَنْتَ',
    latinText: 'Allahumma inni as\'aluka min fadhlika wa rahmatika fa-innahu laa yamlikuhaa illaa ant.',
    translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu dari karunia-Mu dan rahmat-Mu, karena sungguh tidak ada yang memilikinya kecuali Engkau.',
    tataCara: [
      'Setelah shalat Jumat selesai, membaca dzikir dan doa bersama imam dan jamaah.',
      'Melaksanakan Shalat Sunnah Ba\'diyyah Jumat 2 rakaat atau 4 rakaat (bisa dilakukan di masjid atau di rumah).',
      'Keluar dari masjid dengan mendahulukan Kaki Kiri.',
      'Membaca Doa Keluar Masjid di atas untuk memohon kelapangan rezeki halal.'
    ],
    fadhilah: 'Menyempurnakan dan menutupi kekurangan dari shalat fardhu Jumat, mendatangkan keberkahan rezeki, serta menjaga istiqamah ibadah.',
    quranHadith: 'Rasulullah SAW bersabda: "Apabila salah seorang dari kalian telah selesai melaksanakan shalat Jumat, maka hendaklah ia shalat setelahnya sebanyak empat rakaat." (HR. Muslim).'
  },
  { 
    id: 11, 
    period: 'Sore Hari (Ba\'da Ashar - Maghrib)',
    periodBadge: 'Jumat Sore',
    title: 'Berdoa di Waktu Mustajab (Saa\'ah Ijabah)', 
    desc: 'Memperbanyak doa, istighfar, dan zikir pada kurun waktu mulia antara shalat Ashar hingga berkumandangnya azan Maghrib di hari Jumat.', 
    icon: Sparkle,
    tataCara: [
      'Setelah melaksanakan shalat Ashar, usahakan tetap berada dalam keadaan suci dari hadas (berwudhu).',
      'Duduk menghadap kiblat di masjid, musyalla, atau di sajadah tempat ibadah.',
      'Membaca Istighfar, Shalawat Nabi, Surah Al-Ikhlas, Al-Falaq, An-Nas, dan Ayatul Kursi.',
      'Memanjatkan doa-doa hajat pribadi, keluarga, kesehatan, kelapangan rezeki, ampunan dosa orang tua, dan keselamatan umat Islam dengan penuh ketundukan dan keyakinan sampai terbenamnya matahari.'
    ],
    fadhilah: 'Pada hari Jumat terdapat satu waktu rahasia (Saa\'ah Ijabah) yang sangat singkat. Setiap hamba muslim yang berdoa memohon kebaikan kepada Allah SWT pada waktu tersebut pasti akan dikabulkan permintaannya tanpa tertolak.',
    quranHadith: 'Rasulullah SAW bersabda: "Di hari Jumat itu terdapat 12 jam, tidak ada seorang hamba muslim pun yang memohon sesuatu kepada Allah melainkan Allah akan mengabulkannya. Maka carilah waktu itu di akhir jam setelah shalat Ashar." (HR. Abu Dawud, An-Nasa\'i, & Al-Hakim).'
  }
];

const KHUTBAH_PRESETS = [
  'Keutamaan Sedekah di Hari Jumat',
  'Menjaga Sholat 5 Waktu & Kekhusyuan',
  'Adab Bermasyarakat & Ukhuwah Islamiyah',
  'Berbakti Kepada Kedua Orang Tua (Birrul Walidain)',
  'Bahaya Ghibah & Menjaga Kehormatan Lisan',
  'Menyiapkan Bekal Akhirat & Ketakwaan'
];

const LOADING_STEPS = [
  "Menganalisis topik khutbah syar'i...",
  "Menyusun Muqaddimah Bahasa Arab & Rukun Khutbah...",
  "Menuliskan Ayat Al-Qur'an, Hadis & Isi Khutbah I...",
  "Menyiapkan Wasiat Taqwa & Doa Bahasa Arab Khutbah II...",
  "Merapikan naskah siap pakai..."
];

// Helper to remove raw markdown syntax (###, *, **, _, #, etc.)
const cleanMarkdownText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remove ### headers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1') // Remove **bold** or *italic*
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1') // Remove __underline__
    .replace(/^[\*\-]\s+/gm, '• ') // Convert bullet * or - to bullet dot •
    .replace(/`/g, '') // Remove backticks
    .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
    .trim();
};

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="islamic-grid-friday" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-friday)" />
      </svg>
    </div>
  );
};

const FridaySunnahScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<'main' | 'khutbah_form' | 'khutbah_detail'>('main');
  
  const [khutbahTopic, setKhutbahTopic] = useState('');
  const [khutbahResult, setKhutbahResult] = useState('');
  const [generatedTopic, setGeneratedTopic] = useState('');
  
  const [history, setHistory] = useState<KhutbahHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('santri_khutbah_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  
  const [expandedSunnahId, setExpandedSunnahId] = useState<number | null>(null);
  const [showFridayGuide, setShowFridayGuide] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  useEffect(() => {
    let interval: any;
    if (loading) {
      setCurrentStepIdx(0);
      interval = setInterval(() => {
        setCurrentStepIdx(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerateKhutbah = async (topicToUse?: string) => {
    const topic = (topicToUse || khutbahTopic).trim();
    if (!topic) {
      showToast("Harap masukkan atau pilih topik khutbah.", "warning");
      return;
    }
    if (!user) {
      showToast("Kreator Khutbah AI memerlukan login.", "info");
      navigate('/settings');
      return;
    }

    setKhutbahTopic(topic);
    setLoading(true);

    try {
      // Deduct Wasilah
      try {
        await deductWasilahForAI(user.uid, 2, `Kreator Khutbah AI (${topic})`);
      } catch (e) {
        console.warn("Wasilah deduction skipped:", e);
      }

      const prompt = `
Bertindaklah sebagai Khatib Senior Pesantren & Ahli Retorika Dakwah Syar'i.
Buatkan NASKAH KHUTBAH JUMAT LENGKAP, SYAR'I, SANGAT RAPI, SIAP PAKAI DI ATAS MIMBAR DENGAN FORMAT BERSIH TANPA PERLU DIEDIT.

Topik Khutbah: "${topic}"

ATURAN PENULISAN (SANGAT PENTING):
- DILARANG MENGGUNAKAN SIMBOL MARKDOWN SEPERTI ###, **, *, #, ATAU _. Tulis seksi dan judul dengan TEKS BIASA atau KAPITAL BERSIH.
- Jangan gunakan simbol tanda bintang atau pagar apapun.
- Sajikan susunan Khutbah Pertama dan Khutbah Kedua secara lengkap, dari Muqaddimah Arab sampai Doa Penutup.

SUSUNAN NASKAH KHUTBAH SYAR'I:

=== KHUTBAH PERTAMA (KHUTBAH I) ===

[MUQADDIMAH ARAB]
الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلاَ أَنْ هَدَانَا اللَّهُ. أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ سَيِّدَنَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدَنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.

[WASIAT TAQWA]
فَيَا أَيُّهَا الْمُسْلِمُونَ، أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللهِ فَقَدْ فَازَ الْمُتَّقُونَ. قَالَ اللهُ تَعَالَى فِي الْقُرْآنِ الْعَظِيمِ: يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلاَ تَمُوتُنَّ إِلاَّ وَأَنْتُمْ مُسْلِمُونَ.

[ISI KHUTBAH PERTAMA]
Jamaah Jumat yang dimuliakan Allah SWT,
(Sajikan 3-4 paragraf materi mendalam tentang "${topic}". Tuliskan secara santun, ilmiah, menyentuh hati, dan mengalir siap dibaca.)

(Sertakan Ayat Al-Quran pendukung lengkap Teks Arab, Transliterasi Latin, dan Terjemahan)
(Sertakan Hadis Shahih pendukung lengkap Teks Arab, Transliterasi Latin, dan Terjemahan)

[PENUTUP KHUTBAH PERTAMA]
بَارَكَ اللهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ، وَنَفَعَنِي وَإِيَّاكُمْ بِمَا فِيهِ مِنَ الآيَاتِ وَالذِّكْرِ الْحَكِيمِ. أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللهَ الْعَظِيمَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِينَ مِنْ كُلِّ ذَنْبٍ، فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ.


=== KHUTBAH KEDUA (KHUTBAH II) ===

[MUQADDIMAH KHUTBAH KEDUA]
الْحَمْدُ لِلَّهِ عَلَى إِحْسَانِهِ، وَالشُّكْرُ لَهُ عَلَى تَوْفِيقِهِ وَامْتِنَانِهِ. وَأَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَاللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ سَيِّدَنَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ الدَّاعِي إِلَى رِضْوَانِهِ. اللَّهُمَّ صَلِّ عَلَى سَيِّدَنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ وَسَلِّمْ تَسْلِيمًا كَثِيرًا.

[WASIAT TAQWA KHUTBAH KEDUA]
أَمَّا بَعْدُ، فَيَا أَيُّهَا النَّاسُ اتَّقُوا اللهَ فِيمَا أَمَرَ، وَانْتَهُوا عَمَّا نَهَى وَاعْلَمُوا أَنَّ اللهَ أَمَرَكُمْ بِأَمْرٍ بَدَأَ فِيهِ بِنَفْسِهِ وَثَنَّى بِمَلاَئِكَتِهِ بِقُدْسِهِ.

[DOA KHUTBAH KEDUA]
اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، الأَحْيَاءِ مِنْهُمْ وَالأَمْوَاتِ.
اللَّهُمَّ أَعِزَّ الإِسْلاَمَ وَالْمُسْلِمِينَ، وَأَذِلَّ الشِّرْكَ وَالْمُشْرِكِينَ.
رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.

[PENUTUP KHUTBAH KEDUA]
عِبَادَ اللهِ، إِنَّ اللهَ يَأْمُرُ بِالْعَدْلِ وَالإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَى وَيَنْهَى عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ وَالْبَغْيِ، يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ. فَاذْكُرُوا اللهَ الْعَظِيمَ يَذْكُرْكُمْ، وَاشْكُرُوهُ عَلَى نِعَمِهِ يَزِدْكُمْ، وَلَذِكْرُ اللهِ أَكْبَرُ.
`;

      const response = await askReligiousQuery('Kreator Khutbah AI', prompt);
      const cleanedText = cleanMarkdownText(response);
      
      setKhutbahResult(cleanedText);
      setGeneratedTopic(topic);

      // Save to history
      const newItem: KhutbahHistoryItem = {
        id: Date.now().toString(),
        topic,
        content: cleanedText,
        createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setHistory(prev => {
        const filtered = prev.filter(h => h.topic.toLowerCase() !== topic.toLowerCase());
        const updated = [newItem, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('santri_khutbah_history', JSON.stringify(updated));
        } catch (e) {
          console.error("Error saving history:", e);
        }
        return updated;
      });

      setCurrentView('khutbah_detail');
      showToast("Naskah Khutbah lengkap berhasil dibuat!", "success");
    } catch (error: any) {
      console.error(error);
      showToast("Gagal membuat khutbah: " + (error.message || "Terjadi kesalahan"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!khutbahResult) return;
    const fullText = `=== NASKAH KHUTBAH JUMAT ===\nTopik: ${generatedTopic}\n\n${khutbahResult}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast("Naskah khutbah berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (!khutbahResult) return;
    const title = `Naskah Khutbah: ${generatedTopic}`;
    const fullShareText = `=== NASKAH KHUTBAH JUMAT ===\nTopik: ${generatedTopic}\n\n${khutbahResult}\n\n(Dibuat via Aplikasi Santri AI)`;

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, fullShareText);
        return;
      } catch (err) {
        console.warn("Android native share failed:", err);
      }
    }

    if (navigator.share) {
      navigator.share({
        title: title,
        text: fullShareText
      }).catch((err) => {
        if ((err as Error)?.name !== 'AbortError') {
          navigator.clipboard.writeText(fullShareText);
          showToast("Teks naskah khutbah disalin untuk dibagikan!", "info");
        }
      });
    } else {
      navigator.clipboard.writeText(fullShareText);
      showToast("Teks naskah khutbah disalin untuk dibagikan!", "info");
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-xs leading-relaxed';
      case 'lg': return 'text-base leading-loose';
      default: return 'text-sm leading-relaxed';
    }
  };

  // -------------------------------------------------------------
  // VIEW: FORM BUAT KHUTBAH
  // -------------------------------------------------------------
  if (currentView === 'khutbah_form') {
    return (
      <div className="pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-indigo-700 to-slate-900 text-white px-4 py-4 shadow-lg sticky top-0 z-30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('main')} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Kembali"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">
                Buat Khutbah AI
              </h1>
            </div>
          </div>

          {userData && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-300/40 rounded-full text-cyan-200 font-bold text-xs shadow-xs shrink-0">
              <Gem size={13} className="fill-cyan-300 text-cyan-300 animate-pulse" />
              <span>{(userData.wasilah || 0).toLocaleString()} Wasilah</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-700/60 shadow-2xl relative overflow-hidden">
             <IslamicPattern className="text-white opacity-[0.08]" />
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             
             <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-amber-300 border border-white/10">
                     <Scroll size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white tracking-tight text-base">Buat Khutbah Jumat</h3>
                    <p className="text-[10px] text-indigo-200 font-bold">Naskah Lengkap & Siap Mimbar</p>
                  </div>
                </div>

                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 flex items-center gap-1 shadow-xs">
                  <Gem size={11} className="fill-cyan-300 text-cyan-300 animate-pulse" />
                  2 Wasilah
                </span>
             </div>

             <p className="text-xs text-indigo-100/90 mb-5 leading-relaxed font-medium relative z-10">
                Masukkan topik khutbah yang diinginkan atau tekan salah satu opsi populer. AI akan menyusun Khutbah I, Khutbah II, Muqaddimah Arab, Ayat Al-Quran, Hadis, dan Doa secara lengkap.
             </p>

             <div className="space-y-5 relative z-10">
                <div className="relative">
                   <input 
                     type="text" 
                     value={khutbahTopic}
                     onChange={(e) => setKhutbahTopic(e.target.value)}
                     placeholder="Contoh: Keutamaan Sedekah di Hari Jumat"
                     className="w-full bg-slate-950/80 text-white border-2 border-indigo-500/40 focus:border-cyan-400 rounded-2xl px-5 py-4 pr-14 outline-none transition-all text-sm font-bold placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                   />
                   <button 
                     onClick={() => handleGenerateKhutbah()}
                     disabled={loading || !khutbahTopic.trim()}
                     className="absolute right-2 top-2 bottom-2 aspect-square bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                     title="Buat Naskah Khutbah"
                   >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                   </button>
                </div>

                {/* PRESETS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-indigo-200 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-300" /> Topik Populer Khutbah:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {KHUTBAH_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGenerateKhutbah(preset)}
                        disabled={loading}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 text-left active:scale-95 backdrop-blur-xs"
                      >
                        <span>{preset}</span>
                        <ArrowUpRight size={12} className="opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIWAYAT KHUTBAH */}
                {history.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-indigo-200 flex items-center gap-1">
                        <History size={12} className="text-cyan-300" /> Riwayat Khutbah:
                      </span>
                      <button
                        onClick={() => {
                          setHistory([]);
                          localStorage.removeItem('santri_khutbah_history');
                          showToast("Riwayat khutbah dibersihkan.", "info");
                        }}
                        className="text-[10px] text-indigo-300 hover:text-rose-300 transition-colors flex items-center gap-1"
                        title="Hapus Riwayat"
                      >
                        <Trash2 size={11} />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setGeneratedTopic(item.topic);
                            setKhutbahResult(item.content);
                            setCurrentView('khutbah_detail');
                          }}
                          className="px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-cyan-200 rounded-xl text-xs font-bold transition-all border border-cyan-500/30 flex items-center gap-1.5 text-left active:scale-95"
                        >
                          <Scroll size={12} className="text-cyan-300 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.topic}</span>
                          <ArrowUpRight size={12} className="opacity-70 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* FULLSCREEN POPUP LOADING MODAL (Mencegah Pengiriman Ganda) */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Background Accent Glow */}
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Icon */}
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 animate-ping opacity-60" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner relative z-10">
                  <Loader2 size={32} className="animate-spin text-cyan-400" />
                </div>
                <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-300 animate-bounce z-20" />
              </div>

              {/* Text Information */}
              <div className="space-y-1.5 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/30 rounded-full text-[10px] font-black text-cyan-300 uppercase tracking-widest mb-1">
                  <span>Langkah {currentStepIdx + 1}/{LOADING_STEPS.length}</span>
                </div>
                <h3 className="text-base font-black text-white tracking-tight">
                  Sedang Menyusun Naskah Khutbah
                </h3>
                <p className="text-xs font-semibold text-cyan-200 min-h-[36px] flex items-center justify-center leading-relaxed">
                  {LOADING_STEPS[currentStepIdx]}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 relative z-10">
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(15, ((currentStepIdx + 1) / LOADING_STEPS.length) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-normal">
                  Mohon tunggu sejenak, layar terkunci untuk memastikan naskah selesai tanpa pengiriman ganda.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // DETAIL VIEW: HALAMAN BUKA KHUTBAH LENGKAP
  // -------------------------------------------------------------
  if (currentView === 'khutbah_detail' && khutbahResult) {
    return (
      <div className="pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 text-left">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-indigo-700 to-slate-900 text-white px-4 py-4 shadow-lg sticky top-0 z-30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('main')} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Kembali"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">
                Khutbah Jumat
              </h1>
            </div>
          </div>

          {userData && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-300/40 rounded-full text-cyan-200 font-bold text-xs shadow-xs shrink-0">
              <Gem size={13} className="fill-cyan-300 text-cyan-300 animate-pulse" />
              <span>{(userData.wasilah || 0).toLocaleString()} Wasilah</span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4 space-y-4">
          
          {/* Quick Tools Bar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Type size={14} className="text-indigo-600 dark:text-indigo-400" /> Ukuran Teks:
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSize === 'sm' ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  Kecil
                </button>
                <button
                  onClick={() => setFontSize('base')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSize === 'base' ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  Sedang
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSize === 'lg' ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  Besar
                </button>
              </div>
            </div>
          </div>

          {/* Main Khutbah Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase mb-2">
                <Scroll size={14} />
                <span>Naskah Siap Pakai Mimbar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {generatedTopic}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lengkap dengan Khutbah Pertama, Khutbah Kedua, Muqaddimah Arab & Doa.
              </p>
            </div>

            {/* Rendered Text */}
            <div className={`whitespace-pre-line text-slate-800 dark:text-slate-200 font-medium ${getFontSizeClass()}`}>
              {khutbahResult}
            </div>

            {/* Bottom Action Grid */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {/* Regenerate Button */}
              <button
                onClick={() => handleGenerateKhutbah(generatedTopic)}
                disabled={loading}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-200 dark:shadow-none"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Muat Ulang</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full px-4 py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
                >
                  <Share2 size={16} />
                  <span>Bagikan</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCurrentView('khutbah_form')}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Sparkles size={16} className="text-indigo-500" />
                  <span>Pilih Topik Lain</span>
                </button>

                <button
                  onClick={() => setCurrentView('main')}
                  className="w-full px-4 py-2.5 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Utamain</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: PANDUAN, TOMBOL BUAT KHUTBAH, & AMALAN SUNNAH
  // -------------------------------------------------------------
  return (
    <div className="pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 text-left">
      
      {/* LOADING MODAL OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-indigo-500/30 shadow-2xl space-y-5"
            >
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                <Scroll size={32} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles size={12} className="fill-indigo-500" />
                  Kreator Khutbah AI
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Menyusun Naskah Khutbah Syar'i
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold animate-pulse min-h-[32px] flex items-center justify-center px-2">
                  {LOADING_STEPS[currentStepIdx]}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Harap tunggu sebentar, AI sedang merapikan naskah siap pakai mimbar.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 text-white px-4 py-4 shadow-md sticky top-0 z-30 transition-all relative overflow-hidden flex items-center justify-between gap-3">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative z-10"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="relative z-10">
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">Barokah Jumat</h1>
          </div>
        </div>

        {userData && (
          <div className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-300/40 rounded-full text-cyan-200 font-bold text-xs shadow-xs">
            <Gem size={13} className="fill-cyan-300 text-cyan-300 animate-pulse" />
            <span>{(userData.wasilah || 0).toLocaleString()} Wasilah</span>
          </div>
        )}
      </div>

      <div className="px-5 mt-4 relative z-20 space-y-6 pb-12">
        
        {/* Panduan Hari Jumat & Dalil Syariat */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mt-2">
          <button 
            onClick={() => setShowFridayGuide(!showFridayGuide)} 
            className="w-full p-4 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan Syar'i & Dalil Sayyidul Ayyam</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showFridayGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showFridayGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Keistimewaan Hari Jumat (Sayyidul Ayyam)</h4>
                <p>Hari Jumat adalah pimpinan hari-hari di hadapan Allah SWT, memiliki kemuliaan agung yang terbentang mulai Kamis sore setelah Maghrib hingga Jumat sore sebelum Maghrib.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Hadis Shahih:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">1. Hari Penciptaan & Peristiwa Agung:</p>
                  <p className="italic">"Hari terbaik di mana matahari terbit di dalamnya adalah Hari Jumat. Di hari itu Adam diciptakan, dimasukkan ke surga, dan dikeluarkan darinya. Dan kiamat tidak akan terjadi kecuali pada hari Jumat."</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">(HR. Muslim)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Amalan Pokok Hari Jumat</h4>
                <p>Amalan Jumat mencakup pembacaan Surah Yasin, Surah Al-Kahf, memperbanyak Shalawat, mandi Thaharah Jumat, bersuci fisik, menyegarkan diri ke masjid, mendengarkan khutbah dengan khusyuk, serta berikhtiar doa di waktu mustajab sore hari.</p>
              </div>
            </div>
          )}
        </div>

        {/* BUAT KHUTBAH CALLOUT CARD (SINGLE BANNER/BUTTON ACTION) */}
        <div 
          onClick={() => setCurrentView('khutbah_form')}
          className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden border border-indigo-700/50 cursor-pointer hover:border-indigo-400/80 active:scale-[0.99] transition-all group"
        >
           <IslamicPattern className="text-white opacity-[0.08]" />
           
           <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-amber-300 border border-white/10 group-hover:bg-white/20 transition-all">
                     <Scroll size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight">Buat Khutbah AI</h3>
                    <p className="text-[10px] text-indigo-200 font-bold">Naskah Syar'i Siap Mimbar</p>
                  </div>
                </div>

                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 flex items-center gap-1 shadow-xs">
                  <Gem size={11} className="fill-cyan-300 text-cyan-300 animate-pulse" />
                  2 Wasilah
                </span>
              </div>

              <p className="text-xs text-indigo-100 leading-relaxed">
                Buat naskah khutbah Jumat lengkap meliputi Muqaddimah Bahasa Arab, Khutbah Pertama, Khutbah Kedua, Ayat, Hadis, & Doa Bahasa Arab.
              </p>

              <div className="pt-1 flex items-center gap-2">
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setCurrentView('khutbah_form');
                   }}
                   className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                 >
                   <Sparkles size={16} className="text-amber-300" />
                   <span>Buat Khutbah Sekarang</span>
                   <ArrowUpRight size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* RECENT RESULT CARD IF ANY */}
        {khutbahResult && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 p-5 shadow-xl space-y-3">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Naskah Khutbah Terakhir</span>
                </div>
                <button 
                  onClick={() => setCurrentView('khutbah_detail')}
                  className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  <span>Buka Halaman Lengkap</span>
                  <ArrowUpRight size={14} />
                </button>
             </div>
             <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
               {generatedTopic}
             </p>
          </div>
        )}

        {/* AMALAN SUNNAH HARI JUMAT (KAMIS MAGHRIB S.D. JUMAT SORE) */}
        <div className="space-y-4 pt-2">
          <div className="mb-2 px-1">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              Rangkaian Amalan Sunnah Hari Jumat
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Dimulai dari Kamis malam (ba'da Maghrib) hingga Jumat sore sebelum Maghrib. Klik setiap amalan untuk membuka doa, adab & tata cara rinci (Syar'i Aswaja).
            </p>
          </div>

          {FRIDAY_SUNNAHS.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedSunnahId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300"
              >
                {/* Header Card Area (Clickable to toggle expand) */}
                <div 
                  onClick={() => setExpandedSunnahId(isExpanded ? null : item.id)}
                  className="p-4 flex items-center gap-3.5 cursor-pointer select-none"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    <Icon size={22} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        {item.periodBadge}
                      </span>
                    </div>
                    <h3 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>

                  {/* Right side controls: Chevron */}
                  <div className="flex items-center gap-1 shrink-0">
                    <ChevronDown 
                      size={20} 
                      className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} 
                    />
                  </div>
                </div>

                {/* Expanded Detail Panel (Static Syariat Aswaja Rinci) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-emerald-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-4 text-xs text-slate-700 dark:text-slate-300"
                    >
                      {/* Arabic / Doa Box if present */}
                      {item.arabicText && (
                        <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                            Teks Doa / Bacaan Arab:
                          </span>
                          <p className="text-right text-lg font-serif leading-loose text-emerald-950 dark:text-emerald-100" dir="rtl">
                            {item.arabicText}
                          </p>
                          {item.latinText && (
                            <p className="text-[11px] font-semibold italic text-emerald-800 dark:text-emerald-300">
                              "{item.latinText}"
                            </p>
                          )}
                          {item.translation && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              <span className="font-bold">Artinya:</span> {item.translation}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Tata Cara & Adab Rinci */}
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                          <Check size={14} className="text-emerald-600 stroke-[3]" />
                          Tata Cara, Adab & Urutan Syar'i:
                        </span>
                        <ul className="space-y-1.5 pl-2">
                          {item.tataCara.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Fadhilah Box */}
                      <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-1">
                        <span className="font-extrabold text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" />
                          Fadhilah & Keutamaan:
                        </span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {item.fadhilah}
                        </p>
                      </div>

                      {/* Quran / Hadith Box */}
                      <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/50 space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-bold text-[11px]">
                          <BookOpen size={13} className="text-indigo-600" />
                          <span>Dalil Syariat (Aswaja):</span>
                        </div>
                        <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-[11px]">
                          {item.quranHadith}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FridaySunnahScreen;
