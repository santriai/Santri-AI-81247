import { 
  User, 
  Calendar, 
  Compass, 
  Heart, 
  Users, 
  Award, 
  BookOpenCheck, 
  Flame, 
  Scroll, 
  Sparkles, 
  BookOpen
} from 'lucide-react';

export interface PredefinedStory {
  title: string;
  desc: string;
  query: string;
}

export interface KitabCategory {
  id: string;
  title: string;
  subtitle: string;
  arabicTitle: string;
  description: string;
  bannerBg: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  glowColor: string;
  icon: any; // Lucide icon component
  items: PredefinedStory[];
}

export const KITAB_DATA: KitabCategory[] = [
  {
    id: 'sirah-nabawiyah',
    title: 'Sirah Nabawiyah',
    subtitle: 'Kisah Agung Perjalanan Hidup Rasulullah SAW',
    arabicTitle: 'السِّيرَةُ النَّبَوِيَّةُ الْمُطَهَّرَةُ',
    description: 'Menelusuri lembaran suci perjalanan hidup Nabi Muhammad SAW dari masa sebelum kenabian, masa dakwah Makkah penuh ujian, hijrah agung, pembangunan Madinah Al-Munawwarah, hingga kemenangan besar Fathu Makkah.',
    bannerBg: 'bg-gradient-to-br from-[#0c401c] via-[#05230e] to-slate-900',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-emerald-950/50 border border-emerald-500/45',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-900/30',
    icon: Heart,
    items: [
      {
        title: 'Masa Sebelum Kenabian (Masa Kecil & Pemuda)',
        desc: 'Silsilah suci, peristiwa pembelahan dada oleh Jibril, wafatnya ibunda Aminah, hingga pernikahan agung dengan Sayyidah Khadijah.',
        query: 'Uraikan sejarah lengkap kehidupan Nabi Muhammad SAW sebelum kenabian, masa asuhan Halimah As-Sa\'diyyah, perjalanan niaga ke Syam bersama Abu Thalib, hingga peristiwa peletakan Hajar Aswad secara lengkap dan tepercaya berdasarkan Sirah Nabawiyah Aswaja.'
      },
      {
        title: 'Masa Dakwah di Makkah (Periode Ujian)',
        desc: 'Menerima wahyu pertama di Gua Hira, dakwah sembunyi-sembunyi hingga terang-terangan, boikot Syi\'ib, dan cobaan dari kafir Quraisy.',
        query: 'Uraikan kronologi lengkap dakwah Nabi Muhammad SAW di Makkah selama 13 tahun, turunnya wahyu pertama di Gua Hira, penentangan Abu Jahal dan Abu Lahab, peristiwa hijrah ke Habasyah, serta tahun kesedihan (\'Amul Huzni) secara detail berdasarkan Sirah Nabawiyah Aswaja.'
      },
      {
        title: 'Hijrah Agung ke Yatsrib (Madinah)',
        desc: 'Siasat keluar dari kepungan rumah nabi, persembunyian di Gua Tsur bersama Abu Bakar, berdirinya Masjid Quba, hingga sambutan hangat kaum Anshar.',
        query: 'Uraikan kronologi peristiwa Hijrah agung Rasulullah SAW dan Abu Bakar Ash-Shiddiq dari Makkah ke Madinah, mukjizat sarang laba-laba di Gua Tsur, kisah Suraqah bin Malik, hingga pembentukan Piagam Madinah secara detail sesuai kitab Sirah.'
      },
      {
        title: 'Pembentukan Peradaban Madinah',
        desc: 'Mempersaudarakan kaum Muhajirin & Anshar, pembangunan Masjid Nabawi, dan penyusunan undang-undang toleransi multikultural pertama di dunia.',
        query: 'Uraikan strategi Rasulullah SAW dalam membangun peradaban baru di Madinah, mempersaudarakan kaum Muhajirin dan Anshar, kandungan penting Piagam Madinah, serta pembinaan pasar islami secara komprehensif.'
      },
      {
        title: 'Pembebasan Kota Suci Makkah (Fathu Makkah)',
        desc: 'Pelanggaran Perjanjian Hudaibiyah, perjalanan 10.000 pasukan muslim, pembersihan Ka\'bah dari berhala, dan pengampunan massal yang mulia.',
        query: 'Uraikan kronologi lengkap peristiwa Fathu Makkah (Pembebasan Makkah) pada tahun 8 Hijriah, taktik militer Rasulullah yang menghindari pertumpahan darah, penghancuran 360 berhala di sekitar Ka\'bah, dan ampunan agung kepada kaum Quraisy.'
      },
      {
        title: 'Haji Wada\' & Detik-Detik Wafatnya Rasulullah',
        desc: 'Khutbah terakhir di Arafah tentang HAM, penyempurnaan risalah syariat islam, serta duka mendalam saat wafatnya sang kekasih Allah.',
        query: 'Uraikan peristiwa Haji Wada\' (Haji Perpisahan), khutbah monumental Rasulullah SAW tentang kemanusiaan dan keadilan, kronologi turunnya wahyu terakhir, serta detik-detik wafatnya beliau didampingi Sayyidah Aisyah secara mendalam sesuai riwayat shahih.'
      }
    ]
  },
  {
    id: 'kisah-25-nabi',
    title: 'Kisah 25 Nabi & Rasul',
    subtitle: 'Risalah Para Utusan Allah',
    arabicTitle: 'قِصَصُ الْأَنْبِيَاءِ وَالرُّسُلِ',
    description: 'Menelusuri sejarah perjuangan suci para nabi pembawa kebenaran tauhid, mulai dari manusia pertama Nabi Adam AS hingga penutup para nabi Rasulullah Muhammad SAW.',
    bannerBg: 'bg-gradient-to-br from-[#0d4f21] via-[#052b11] to-slate-900',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-emerald-950/50 border border-emerald-500/45',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-900/30',
    icon: User,
    items: [
      {
        title: 'Nabi Adam AS',
        desc: 'Manusia pertama yang diciptakan Allah SWT dari tanah, kisah kehidupan di surga, hingga diturunkan ke bumi.',
        query: 'Kisah lengkap Nabi Adam AS sejak diciptakan, kedudukannya di atas malaikat, godaan iblis di surga, diturunkannya ke bumi, hingga taubatnya secara lengkap berdasarkan dalil-dalil Al-Quran, hadits shahih, dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Idris AS',
        desc: 'Nabi pertama yang pandai menulis dengan pena, menjahit pakaian, serta dianugerahi kecerdasan tinggi.',
        query: 'Kisah lengkap Nabi Idris AS, kecerdasannya dalam ilmu falak dan menulis, kezuhudannya, serta peristiwa diangkatnya beliau ke langit berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Nuh AS',
        desc: 'Ketabahan dakwah selama ratusan tahun, mukjizat pembuatan bahtera raksasa, dan banjir besar yang melanda bumi.',
        query: 'Kisah lengkap perjuangan dakwah Nabi Nuh AS, kesabarannya menghadapi pembangkangan kaumnya termasuk istri dan anaknya, mukjizat bahtera raksasa, dan topan besar berdasarkan dalil Al-Quran dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Hud AS',
        desc: 'Perjuangan dakwah menyeru kaum \'Ad yang perkasa namun angkuh hingga diturunkan azab angin topan dahsyat.',
        query: 'Kisah lengkap Nabi Hud AS berdakwah kepada kaum \'Ad, pembangkangan mereka terhadap kebenaran, and azab angin dingin yang sangat kencang berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Saleh AS',
        desc: 'Mukjizat unta betina yang keluar dari batu karang besar sebagai pembuktian dakwah bagi kaum Tsamud.',
        query: 'Kisah lengkap Nabi Saleh AS, mukjizat unta betina dari batu karang untuk kaum Tsamud, pembunuhan unta tersebut, dan azab petir dahsyat berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ibrahim AS',
        desc: 'Bapak para Nabi (Abul Anbiya), pencarian tuhan, perlawanan terhadap Namrud, dan mukjizat tidak hangus dibakar api.',
        query: 'Kisah lengkap perjuangan Nabi Ibrahim AS menghancurkan berhala, perlawanan terhadap Raja Namrud, mukjizat selamat dari api raksasa, dan pembangunan Ka\'bah bersama Nabi Ismail berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Luth AS',
        desc: 'Dakwah menyeru kaum Sodom untuk meninggalkan kemungkaran besar hingga bumi mereka dibalikkan oleh Allah.',
        query: 'Kisah lengkap Nabi Luth AS berdakwah di negeri Sodom, pembangkangan kaumnya, dan azab dihujani batu belerang panas serta bumi dibalikkan berdasarkan dalil Al-Quran dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ismail AS',
        desc: 'Ketabahan luar biasa saat menerima perintah penyembelihan yang menjadi asal-usul ibadah Qurban.',
        query: 'Kisah lengkap Nabi Ismail AS sejak bayi di lembah tandus Makkah, keajaiban sumur Zamzam, kesabaran luar biasa saat diperintahkan untuk disembelih, dan ketaatannya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ishaq AS',
        desc: 'Putra kedua Nabi Ibrahim dari Sayyidah Sarah, pembawa kebahagiaan di usia senja kedua orang tuanya.',
        query: 'Kisah lengkap Nabi Ishaq AS, kelahirannya yang dikabarkan oleh para malaikat, kelembutan akhlaknya, dan keturunannya yang melahirkan para nabi Bani Israil berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ya\'qub AS',
        desc: 'Kasih sayang ayah yang mendalam, kesabaran menanti Yusuf, hingga dianugerahi gelar Israil.',
        query: 'Kisah lengkap Nabi Ya\'qub AS, kasih sayangnya yang tulus kepada anak-anaknya, kesedihannya yang mendalam hingga matanya memutih karena terpisah dari Yusuf, dan kesabarannya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Yusuf AS',
        desc: 'Dibuang ke sumur, cobaan fitnah wanita istana, mukjizat menafsirkan mimpi, hingga memimpin Mesir.',
        query: 'Kisah lengkap Nabi Yusuf AS, ketampanan batin dan fisiknya, fitnah Zulaikha, kesabaran dalam penjara, mukjizat takwil mimpi, hingga kejayaannya menjadi bendaharawan Mesir berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ayyub AS',
        desc: 'Teladan kesabaran sejati dalam menghadapi ujian penyakit parah, kemiskinan, dan kehilangan seluruh anaknya.',
        query: 'Kisah lengkap keteladanan kesabaran Nabi Ayyub AS saat diuji dengan penyakit parah yang menggerogoti tubuh, kehilangan kekayaan dan keluarga, serta keikhlasannya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Syu\'aib AS',
        desc: 'Dakwah menyeru kaum Madyan yang curang dalam timbangan hingga datangnya azab gempa bumi yang dahsyat.',
        query: 'Kisah lengkap Nabi Syu\'aib AS (Khatibul Anbiya) menyeru kaum Madyan agar berbuat adil dalam menakar dan menimbang, serta azab awan panas berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Musa AS',
        desc: 'Menghadapi kelaliman Firaun, mukjizat membelah Laut Merah, dan memimpin Bani Israil.',
        query: 'Kisah lengkap Nabi Musa AS sejak hanyut di Sungai Nil, diasuh di istana Firaun, pelariannya ke Madyan, mukjizat membelah Laut Merah, dan penerimaan Taurat di Bukit Sinai berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Harun AS',
        desc: 'Kakak kandung Nabi Musa yang dianugerahi kefasihan lisan sebagai pendamping dakwah menghadapi Firaun.',
        query: 'Kisah lengkap Nabi Harun AS sebagai pendamping setia Nabi Musa, kefasihan bicaranya, ketegasannya menjaga kaumnya saat ditinggal Musa ke bukit Tursina berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Dzulkifli AS',
        desc: 'Raja yang adil, penyabar, memegang teguh janji dakwah, dan selalu berpuasa di siang hari.',
        query: 'Kisah lengkap Nabi Dzulkifli AS, kesanggupannya memegang amanah memimpin rakyat dengan keadilan, ketabahan menghadapi cobaan iblis, dan rujukan sejarahnya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Daud AS',
        desc: 'Mengalahkan raksasa Jalut, mukjizat melunakkan besi dengan tangan kosong, dan keindahan suara kitab Zabur.',
        query: 'Kisah lengkap Nabi Daud AS mengalahkan Jalut saat muda, mukjizat melunakkan besi tanpa api, keindahan suaranya saat melantunkan Zabur, dan puasanya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Sulaiman AS',
        desc: 'Raja agung pemegang kekuasaan atas manusia, jin, angin, serta berkemampuan memahami bahasa hewan.',
        query: 'Kisah lengkap Nabi Sulaiman AS, mukjizat menguasai bangsa jin dan angin, dialog dengan semut dan burung hud-hud, kisah dengan Ratu Balqis, dan kesederhanaannya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ilyas AS',
        desc: 'Dakwah menyeru kaum Ba\'labak agar meninggalkan penyembahan berhala Ba\'al hingga tertimpa azab kekeringan panjang.',
        query: 'Kisah lengkap Nabi Ilyas AS menentang penyembahan berhala Ba\'al, keteguhan dakwahnya, dan azab kemarau panjang yang menimpa kaumnya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Ilyasa\' AS',
        desc: 'Penerus dakwah Nabi Ilyas yang menjaga kemurnian tauhid Bani Israil dengan penuh kesabaran.',
        query: 'Kisah lengkap Nabi Ilyasa\' AS meneruskan dakwah menegakkan tauhid, mukjizat penyembuhan penyakit, dan kepemimpinannya menuntun umat berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Yunus AS',
        desc: 'Ditelan ikan paus raksasa, tasbih di dalam kegelapan lautan yang menyelamatkannya atas izin Allah.',
        query: 'Kisah lengkap Nabi Yunus AS, keputusasaan meninggalkan kaumnya, peristiwa dilempar ke laut, mukjizat selamat di perut ikan paus, doa tasbihnya yang dahsyat, dan kembalinya beliau ke kaumnya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Zakaria AS',
        desc: 'Doa khusyu\' memohon keturunan di usia senja hingga dikabulkan Allah dengan kelahiran nabi suci Yahya.',
        query: 'Kisah lengkap Nabi Zakaria AS memelihara Sayyidah Maryam di Mihrab, doa tulus memohon anak di masa tua, mukjizat dikaruniai nabi Yahya, dan syahidnya berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Yahya AS',
        desc: 'Putra Nabi Zakaria yang berkarakter zuhud, berilmu tinggi sejak kecil, dan memegang teguh syariat hukum.',
        query: 'Kisah lengkap Nabi Yahya AS sejak kecil mencintai ilmu dan kitab, kezuhudan hidupnya di padang pasir, ketegasannya membela syariat dari raja zalim berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Nabi Isa AS',
        desc: 'Lahir tanpa ayah dari perawan Maryam, mukjizat berbicara sejak bayi, menyembuhkan buta, hingga diangkat ke langit.',
        query: 'Kisah lengkap Nabi Isa AS lahir dari Sayyidah Maryam tanpa perantara ayah, mukjizat berbicara saat buaian, menghidupkan orang mati atas izin Allah, makar Yahudi, dan peristiwa diangkatnya ke langit berdasarkan dalil dan kitab-kitab Ahlussunnah wal Jama\'ah.'
      }
    ]
  },
  {
    id: 'sahabat-khulafaur-rasyidin',
    title: 'Kisah Sahabat & Khulafaur Rasyidin',
    subtitle: 'Bintang-Bintang Penerang Generasi Umat',
    arabicTitle: 'سِيَرُ الصَّحَابَةِ وَالْخُلَفَاءِ الرَّاشِدِينَ',
    description: 'Riwayat perjuangan para sahabat setia pendamping dakwah Nabi Muhammad SAW, kepemimpinan agung empat Khulafaur Rasyidin, Assabiqunal Awwalun, dan para prajurit legendaris penegak tauhid.',
    bannerBg: 'bg-gradient-to-br from-[#1b3d54] via-[#0b202e] to-slate-900',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-950/50 border border-blue-500/45',
    iconColor: 'text-blue-400',
    glowColor: 'shadow-blue-900/30',
    icon: Users,
    items: [
      {
        title: 'Abu Bakar Ash-Shiddiq (Sang Penyelamat)',
        desc: 'Sahabat terdekat nabi, pemegang gelar Ash-Shiddiq, ketegasan memerangi nabi palsu, dan pelopor pengumpulan mushaf Al-Quran.',
        query: 'Uraikan sejarah kepemimpinan Khalifah Abu Bakar Ash-Shiddiq, keteguhan jiwanya menyikapi wafatnya Rasulullah, perang riddah terhadap kemurtadan, keputusan mulia mengumpulkan mushaf, dan kesederhanaannya yang agung sesuai akidah Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Umar bin Khattab (Keadilan yang Ditakuti Setan)',
        desc: 'Pemimpin bergelar Al-Faruq, keadilan hukum yang legendaris, ekspansi wilayah islam yang damai, serta kesederhanaan hidup yang menggetarkan raja Romawi.',
        query: 'Uraikan kisah kepemimpinan Khalifah Umar bin Khattab (Al-Faruq), sejarah masuk islamnya yang membawa kejayaan dakwah, penaklukan Baitul Maqdis tanpa kekerasan, penetapan sistem administrasi modern dan kalender hijriah, serta kesyahidannya.'
      },
      {
        title: 'Utsman bin Affan (Dzun Nurain yang Dermawan)',
        desc: 'Pemilik dua cahaya nabi, kedermawanan tiada banding penyumbang sumur Ruma, hingga standarisasi mushaf mushaf Al-Quranutsmani.',
        query: 'Uraikan riwayat hidup Khalifah Utsman bin Affan, gelar Dzun Nurain, kedermawanan luar biasa membeli sumur dari Yahudi untuk umat, penyusunan Mushaf Al-Quran terstandar (Rasm Usmani), fitnah keji yang melanda kekhalifahannya, hingga wafatnya saat membaca Al-Quran.'
      },
      {
        title: 'Ali bin Abi Thalib (Pintu Gerbang Kota Ilmu)',
        desc: 'Kepasrahan menggantikan tidur nabi saat malam hijrah, kepemimpinan penuh dinamika ujian fitnah internal, serta kefasihan tutur kata yang mendalam.',
        query: 'Uraikan kisah Khalifah Ali bin Abi Thalib, kecerdasannya sejak usia belia, heroisme di perang Khaybar, kesabaran menghadapi perang Jamal dan Siffin, hingga wejangan-wejangan hikmahnya yang mendalam berdasarkan sudut pandang Aswaja.'
      },
      {
        title: 'Assabiqunal Awwalun (Generasi Pertama)',
        desc: 'Keteguhan iman para pemeluk Islam pertama yang disiksa tanpa batas demi kalimat Tauhid.',
        query: 'Uraikan kisah perjuangan golongan Assabiqunal Awwalun, seperti keteguhan iman Bilal bin Rabah di bawah batu terik, keluarga Ammar bin Yasir (Sumayyah wanita pertama yang syahid), Abu Ubaidah, dan Khadijah Al-Kubra.'
      },
      {
        title: '10 Sahabat yang Dijamin Masuk Surga',
        desc: 'Mengenal sepuluh tokoh utama yang dijamin meraih ridha surga langsung melalui lisan Rasulullah SAW semasa hidup.',
        query: 'Uraikan daftar dan biografi ringkas sepuluh Sahabat Nabi yang dijamin masuk surga (Al-Asyarah al-Mubasysyaruna bil Jannah), keutamaan karakter masing-masing, serta kontribusi besarnya bagi dakwah islam.'
      },
      {
        title: 'Khalid bin Walid (Pedang Allah yang Terhunus)',
        desc: 'Panglima jenius tak terkalahkan dalam puluhan pertempuran besar, yang melarutkan ketenaran jiwanya dalam ketundukan taat kepada khalifah.',
        query: 'Uraikan kisah kepahlawanan Khalid bin Walid, gelar Saifullah Al-Maslul (Pedang Allah yang Terhunus), strategi perang jenius di Perang Mut\'ah dan Yarmuk, serta keluhuran jiwanya saat ikhlas dicopot dari jabatan panglima oleh Khalifah Umar.'
      }
    ]
  },
  {
    id: 'dinasti-kesultanan',
    title: 'Dinasti & Kesultanan Islam',
    subtitle: 'Pasang Surut Kejayaan Peradaban Khilafah',
    arabicTitle: 'تَارِيخُ الدُّوَلِ وَالْخِلَافَاتِ الْإِسْلَامِيَّةِ',
    description: 'Sejarah kekuasaan, pemerintahan, kemakmuran, dan kejatuhan khilafah-khilafah besar islam dari era keemasan Dinasti Umayyah, Abbasiyah, Andalusia, Mamluk, hingga Ottoman.',
    bannerBg: 'bg-gradient-to-br from-[#4e1010] via-[#2d0707] to-slate-900',
    borderColor: 'border-red-500/30',
    iconBg: 'bg-red-950/50 border border-red-500/45',
    iconColor: 'text-red-400',
    glowColor: 'shadow-red-900/30',
    icon: Award,
    items: [
      {
        title: 'Dinasti Umayyah (Kejayaan Damaskus)',
        desc: 'Peralihan sistem pemerintahan islam, pembangunan masjid monumental, hingga perluasan dakwah ke benua Eropa Utara.',
        query: 'Uraikan sejarah lengkap berdirinya Dinasti Umayyah di Damaskus oleh Muawiyah bin Abi Sufyan, masa kejayaan di bawah Abdul Malik bin Marwan dan Al-Walid, pembangunan Dome of the Rock, perluasan wilayah, hingga keruntuhannya.'
      },
      {
        title: 'Dinasti Abbasiyah (Era Keemasan Sains Dunia)',
        desc: 'Zaman keemasan sains, filsafat, kedokteran, berdirinya perpustakaan agung Bayt al-Hikmah, dan kepemimpinan bijak Harun Ar-Rasyid.',
        query: 'Uraikan sejarah Zaman Keemasan Islam (Golden Age) di bawah Dinasti Abbasiyah di Baghdad, pendirian Bayt al-Hikmah, masa pemerintahan Harun Ar-Rasyid dan Al-Ma\'mun, gerakan penerjemahan karya ilmiah, hingga serbuan tentara Mongol yang memusnahkan Baghdad.'
      },
      {
        title: 'Kekhalifahan Islam Andalusia (Spanyol)',
        desc: 'Cahaya peradaban murni di tengah kegelapan Eropa, kemakmuran Cordoba dan Granada, serta toleransi indah tiga agama.',
        query: 'Uraikan sejarah masuknya Islam ke Spanyol (Andalusia) oleh Thariq bin Ziyad, kejayaan Kekhalifahan Cordoba, perkembangan sains termaju di Eropa, keindahan istana Alhambra di Granada, hingga peristiwa menyedihkan Reconcquista.'
      },
      {
        title: 'Kesultanan Utsmaniyah (Kekuatan Ottoman)',
        desc: 'Kekhalifahan islam pamungkas yang berpusat di Istanbul, pemenuhan nubuwat penaklukan Konstantinopel, hingga disegani dunia barat.',
        query: 'Uraikan sejarah Kesultanan Utsmaniyah (Ottoman Empire) dari kabilah kecil hingga kekhalifahan adidaya, penaklukan legendaris Konstantinopel oleh Sultan Muhammad Al-Fatih, masa keemasan Suleiman Al-Qanuni, hingga keruntuhannya pasca Perang Dunia I.'
      },
      {
        title: 'Dinasti Mamluk (Benteng Pertahanan Syam)',
        desc: 'Kekuatan ksatria budak berkuda di Mesir yang menepis serbuan dahsyat kekaisaran Mongol dan melestarikan ilmu syariat.',
        query: 'Uraikan sejarah Dinasti Mamluk di Mesir, keahlian militer mereka yang berhasil menghentikan invasi Mongol di perang Ain Jalut, perlindungan terhadap sisa-sisa Khilafah Abbasiyah, dan kontribusinya melahirkan ulama-ulama besar.'
      },
      {
        title: 'Kesultanan Mughal di India',
        desc: 'Dakwah islam di anak benua India, perpaduan seni budaya yang melahirkan keindahan Taj Mahal, dan kemakmuran ekonomi.',
        query: 'Uraikan sejarah Kesultanan Mughal di India, dari pendiri Babur, masa kejayaan Akbar dan Shah Jahan yang membangun Taj Mahal, hingga kepemimpinan zuhud Aurangzeb yang menerapkan syariat secara teguh.'
      }
    ]
  },
  {
    id: 'cendekiawan-ilmuwan',
    title: 'Cendekiawan & Ilmuwan Muslim',
    subtitle: 'Pencetus Sains & Pengetahuan Dunia',
    arabicTitle: 'عُلَمَاءُ الْعُلُومِ وَالْفَلَسِفَةِ الْمُسْلِمُونَ',
    description: 'Mengenang jasa para ilmuwan muslim peletak dasar sains modern, kedokteran, matematika, astronomi, sosiologi, dan geografi di era keemasan Islam.',
    bannerBg: 'bg-gradient-to-br from-[#5c3c0a] via-[#332003] to-slate-900',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-950/50 border border-amber-500/45',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-900/30',
    icon: BookOpenCheck,
    items: [
      {
        title: 'Ibnu Sina (Avicenna) - Bapak Kedokteran',
        desc: 'Penyusun kitab masterpiece Kedokteran "Al-Qanun fi at-Tibb" yang memimpin rujukan akademis Eropa selama 600 tahun.',
        query: 'Uraikan biografi lengkap Ibnu Sina (Avicenna), kejeniusannya menguasai berbagai cabang ilmu sejak muda, penemuan-penemuan klinisnya, kitab Al-Qanun fi at-Tibb dan Al-Syifa, serta kesalehan hidupnya.'
      },
      {
        title: 'Al-Khwarizmi - Penemu Aljabar & Algoritma',
        desc: 'Tokoh jenius matematika penemu angka nol, sistem desimal, logaritma, yang mendasari era teknologi komputasi hari ini.',
        query: 'Uraikan biografi lengkap Muhammad bin Musa Al-Khwarizmi, perannya di Bayt al-Hikmah, penulisan kitab Al-Jabr wa al-Muqabala, penemuan algoritma dan angka nol, serta pengaruhnya pada sains dunia.'
      },
      {
        title: 'Ibnu Battuta - Penjelajah Ulung Tiga Benua',
        desc: 'Mengembara sejauh 120.000 kilometer melintasi perbatasan dunia islam abad pertengahan, termasuk berkunjung ke Nusantara.',
        query: 'Uraikan riwayat petualangan Ibnu Battuta, rute perjalanan melintasi Afrika, Timur Tengah, India, Tiongkok, hingga kesaksiannya mengunjungi Kesultanan Samudera Pasai di Nusantara secara detail.'
      },
      {
        title: 'Al-Biruni - Ilmuwan Ensiklopedis Pembelah Bumi',
        desc: 'Pelopor geodesi, fisika, astronomi yang mampu menghitung keliling bumi secara presisi ribuan tahun lalu.',
        query: 'Uraikan biografi Al-Biruni, kejeniusan multidisiplin ilmu yang dimilikinya, korespondensi dengan Ibnu Sina, metode ilmiah menghitung diameter dan keliling bumi, serta kajiannya tentang peradaban India.'
      },
      {
        title: 'Ibnu Khaldun - Pelopor Sosiologi & Sejarah',
        desc: 'Peletak dasar ilmu sosiologi, ekonomi politik, dan metodologi kritis sejarah melalui karya fenomenal "Muqaddimah".',
        query: 'Uraikan sejarah kehidupan Ibnu Khaldun, konsep "Ashabiyah" (solidaritas sosial), teori siklus kebangkitan dan keruntuhan peradaban dalam kitab Muqaddimah, serta pengaruh pemikirannya pada sosiologi modern.'
      },
      {
        title: 'Al-Zahrawi (Albucasis) - Bapak Bedah Modern',
        desc: 'Penemu benang jahit luka dalam (catgut), alat forceps kebidanan, and penyusun ensiklopedia bedah pertama di dunia.',
        query: 'Uraikan kisah hidup Abu al-Qasim Al-Zahrawi, sumbangsih besarnya dalam dunia kedokteran bedah, penulisan kitab Al-Tasrif, serta berbagai inovasi instrumen operasi yang masih dipakai hingga kini.'
      }
    ]
  },
  {
    id: 'perang-pertempuran',
    title: 'Perang & Pertempuran Bersejarah',
    subtitle: 'Strategi & Kepahlawanan Pembela Akidah',
    arabicTitle: 'الْغَزَوَاتُ وَالْمَعَارِكُ الْإِسْلَامِيَّةُ الْعَظِيمَةُ',
    description: 'Catatan taktik militer, heroisme, serta hikmah di balik perang-perang besar penentu eksistensi dakwah Islam dari masa Rasulullah hingga pembebasan Baitul Maqdis.',
    bannerBg: 'bg-gradient-to-br from-[#3b0d4f] via-[#21052e] to-slate-900',
    borderColor: 'border-fuchsia-500/30',
    iconBg: 'bg-fuchsia-950/50 border border-fuchsia-500/45',
    iconColor: 'text-fuchsia-400',
    glowColor: 'shadow-fuchsia-900/30',
    icon: Flame,
    items: [
      {
        title: 'Trilogi Perang Nabi: Badar, Uhud, & Khandaq',
        desc: 'Tiga pertempuran awal pembentuk fondasi militer islam, bantuan malaikat di Badar, hikmah ketaatan di Uhud, and kecerdasan taktis parit di Khandaq.',
        query: 'Uraikan secara komprehensif kronologi, strategi, jalannya pertempuran, dan hikmah spiritual dari tiga perang utama Rasulullah SAW: Perang Badar Kubra, Perang Uhud, dan Perang Khandaq (Ahzab) berdasarkan kitab tarikh mu\'tabar.'
      },
      {
        title: 'Perang Yarmuk (Mengguncang Kedigdayaan Romawi)',
        desc: '40.000 pasukan muslim mengalahkan 150.000 tentara Bizantium di bawah kepemimpinan jenius taktis Khalid bin Walid.',
        query: 'Uraikan sejarah lengkap Perang Yarmuk, latar belakang konflik dengan Bizantium Romawi, taktik formasi berkuda Khalid bin Walid, heroisme para wanita muslimah di garis belakang, and dampak kemenangan besar ini bagi pembukaan wilayah Syam.'
      },
      {
        title: 'Perang Qadisiyyah (Membuka Gerbang Persia)',
        desc: 'Kepemimpinan Saad bin Abi Waqqash menghadapi rintangan gajah perang dan pasukan raksasa kekaisaran Sassanid.',
        query: 'Uraikan kronologi Perang Qadisiyyah, kepemimpinan panglima Saad bin Abi Waqqash, kisah diplomatik utusan muslim (Rib\'i bin Amir) di hadapan Rustam, jalannya pertempuran menghadapi gajah, and runtuhnya imperium Sassanid Persia.'
      },
      {
        title: 'Perang Salib & Pembebasan Yerusalem',
        desc: 'Heroisme agung Sultan Shalahuddin Al-Ayyubi merebut kembali kota suci Baitul Maqdis dengan kelembutan akhlak ksatria.',
        query: 'Uraikan kisah kepahlawanan Sultan Shalahuddin Al-Ayyubi dalam Perang Salib, kronologi kemenangan telak di Pertempuran Hittin, pembebasan kota Yerusalem (Baitul Maqdis), serta kemuliaan akhlaknya memperlakukan tawanan perang kristen.'
      },
      {
        title: 'Penaklukan Konstantinopel (Fathu Qonstantiniyyah)',
        desc: 'Siasat gemilang memindahkan puluhan kapal perang melintasi bukit daratan dalam semalam oleh Sultan Muhammad Al-Fatih.',
        query: 'Uraikan kronologi lengkap pembebasan Konstantinopel tahun 1453 oleh Sultan Muhammad Al-Fatih, taktik pembuatan meriam raksasa (Basilica), pemindahan kapal lewat darat bukit Galata, dan keruntuhan kekaisaran Romawi Timur sesuai ramalan Rasulullah.'
      },
      {
        title: 'Pertempuran Ain Jalut (Menghancurkan Mitos Mongol)',
        desc: 'Keberanian Sultan Saifuddin Qutuz dan Panglima Baibars memukul mundur tentara bengis Mongol yang menyapu separuh bumi.',
        query: 'Uraikan sejarah pertempuran Ain Jalut tahun 1260 M, ancaman mengerikan Hulagu Khan setelah membumihanguskan Baghdad, strategi jebakan Sultan Saifuddin Qutuz (Mamluk), and kemenangan penting penyelamat peradaban Islam dari kepunahan.'
      }
    ]
  },
  {
    id: 'sejarah-nusantara',
    title: 'Sejarah Islam Nusantara',
    subtitle: 'Sinar Dakwah Damai di Bumi Pertiwi',
    arabicTitle: 'تَارِيخُ نَشْرِ الْإِسْلَامِ فِي أَرْخَبِيلِ نُوسَانْتَارَا',
    description: 'Di luar dakwah agung Walisongo, pelajari sejarah berdiri dan jayanya kerajaan-kerajaan Islam pertama serta kontribusi ulama nusantara dalam sejarah bangsa.',
    bannerBg: 'bg-gradient-to-br from-[#593717] via-[#2f1b08] to-slate-905',
    borderColor: 'border-amber-700/30',
    iconBg: 'bg-amber-950/50 border border-amber-700/45',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-900/30',
    icon: Compass,
    items: [
      {
        title: 'Kesultanan Samudera Pasai (Serambi Makkah)',
        desc: 'Kerajaan Islam pertama di nusantara, pusat mercusuar kajian hukum syafii, and persinggahan pelaut dunia.',
        query: 'Uraikan sejarah lengkap berdirinya Kesultanan Samudera Pasai di Aceh oleh Marah Silu (Sultan Malikussaleh), peranannya sebagai pusat penyebaran islam di Asia Tenggara, sistem ekonomi koin emas, serta catatan perjalanan Ibnu Battuta di sana.'
      },
      {
        title: 'Kesultanan Demak & Mataram Islam',
        desc: 'Kerajaan Islam pertama di tanah Jawa perintis tatanan sosial baru, disusul ketegasan Sultan Agung Mataram melawan penjajah.',
        query: 'Uraikan sejarah berdiri dan runtuhnya Kesultanan Demak di bawah Raden Patah, peranan Walisongo di dalamnya, transisi menuju Kesultanan Pajang, hingga masa kejayaan Mataram Islam di bawah kepemimpinan agung Sultan Agung Hanyokrokusumo.'
      },
      {
        title: 'Kesultanan Gowa-Tallo & Ternate-Tidore',
        desc: 'Kekuatan maritim tangguh Sulawesi dan kepulauan rempah Maluku pembela kedaulatan tauhid dari imperialis.',
        query: 'Uraikan sejarah masuknya Islam ke Sulawesi Selatan (Kerajaan Gowa-Tallo) oleh Tiga Dato, peran Sultan Alauddin, serta kejayaan perdagangan rempah Kesultanan Ternate dan Tidore di bawah Sultan Baabullah mengusir Portugis.'
      },
      {
        title: 'Syaikh Nawawi Al-Bantani - Maha Guru Ulama Nusantara',
        desc: 'Putra Banten yang menjadi ulama besar rujukan di tanah suci Makkah, bergelar Sayyid Ulama Hijaz pencetak pendiri ormas besar Indonesia.',
        query: 'Uraikan biografi lengkap Syaikh Nawawi Al-Bantani, sanad keilmuannya, karya-karya kitab tafsir dan fiqih kuningnya yang dipelajari dunia, serta keteladanannya mendidik tokoh-tokoh besar pendiri NU dan Muhammadiyah.'
      },
      {
        title: 'Buya Hamka - Ulama, Sastrawan, & Penulis Tafsir Al-Azhar',
        desc: 'Ketua MUI pertama, perintis tafsir monumentalnya "Tafsir Al-Azhar" di dalam penjara tirani politik.',
        query: 'Uraikan biografi dan perjuangan Prof. Dr. KH. Abdul Malik Karim Amrullah (Buya Hamka), perannya dalam dakwah kultural sastra, keteguhan sikap politiknya, and proses penulisan Tafsir Al-Azhar yang monumental.'
      }
    ]
  },
  {
    id: 'wanita-agung-islam',
    title: 'Wanita Agung & Srikandi Islam',
    subtitle: 'Teladan Keteguhan Iman & Kemuliaan Akhlak',
    arabicTitle: 'سَيِّدَاتُ نِسَاءِ الْعَالَمِينَ فِي الْإِسْلَامِ',
    description: 'Mutiara keteladanan para wanita mulia yang dijamin surga, pejuang perang yang gagah berani, and tokoh sufi pembawa cinta ilahi.',
    bannerBg: 'bg-gradient-to-br from-[#4f1335] via-[#2d051c] to-slate-900',
    borderColor: 'border-pink-500/30',
    iconBg: 'bg-pink-950/50 border border-pink-500/45',
    iconColor: 'text-pink-400',
    glowColor: 'shadow-pink-900/30',
    icon: Heart,
    items: [
      {
        title: 'Sayyidah Maryam binti Imran (Kesucian Batin)',
        desc: 'Ibunda Nabi Isa AS, wanita suci penjaga kesucian diri, ketabahan mutlak menghadapi badai fitnah keji kaum Yahudi.',
        query: 'Uraikan kisah Sayyidah Maryam binti Imran berdasarkan ayat-ayat Al-Quran, pengabdiannya di Baitul Maqdis di bawah asuhan nabi Zakaria, mukjizat kehamilan tanpa suami, kesabaran melahirkan di bawah pohon kurma, dan jaminan surga untuknya.'
      },
      {
        title: 'Sayyidah Asyiyah - Istri Firaun Pembela Tauhid',
        desc: 'Ratu istana Mesir yang mengorbankan segala kemegahan dunia demi mempertahankan iman dari siksaan kejam suaminya.',
        query: 'Uraikan kisah kepahlawanan Sayyidah Asyiyah (istri Firaun), kelembutan hatinya menyelamatkan bayi Musa, rahasia keimanannya yang terbongkar, keteguhan menghadapi siksaan besi di bawah terik, serta doa agungnya memohon dibangunkan rumah di surga.'
      },
      {
        title: 'Sayyidah Khadijah Al-Kubra (Cinta & Pengorbanan)',
        desc: 'Istri pertama nabi, wanita pertama pembela risalah dengan menyerahkan seluruh jiwa raga dan kekayaan melimpahnya.',
        query: 'Uraikan riwayat hidup Sayyidah Khadijah Al-Kubra, profil kewirausahaannya yang mulia, penenang kalbu Rasulullah saat menerima wahyu gemetar di Gua Hira, pengorbanan hartanya saat boikot syi\'ib, serta keagungan derajatnya di mata Allah.'
      },
      {
        title: 'Sayyidah Aisyah binti Abu Bakar (Gudang Ilmu Syariat)',
        desc: 'Istri tercinta nabi, wanita jenius perawi ribuan hadits, pelopor pendidikan kaum hawa, and rujukan hukum para sahabat.',
        query: 'Uraikan sejarah hidup Sayyidah Aisyah binti Abu Bakar, kecerdasan ingatan luar biasanya dalam merekam kehidupan rumah tangga nabi, sumbangsih periwayatan hadits dan hukum fiqih, serta perannya sebagai guru umat pasca wafatnya nabi.'
      },
      {
        title: 'Sayyidah Fatimah Az-Zahra (Mutiara Kesayangan)',
        desc: 'Putri bungsu kesayangan Rasulullah, pemimpin wanita di surga, teladan kesederhanaan and kelembutan akhlak putri nabi.',
        query: 'Uraikan kisah hidup Sayyidah Fatimah Az-Zahra (Ummu Abiha), hubungannya yang sangat erat dengan Rasulullah, kisah cinta bersahajanya dengan Sayyidina Ali, kehidupan rumah tangga yang penuh kezuhudan, serta kemuliaannya.'
      },
      {
        title: 'Nusaibah binti Ka\'ab (Perisai Hidup Rasulullah)',
        desc: 'Srikandi perkasa penangkis sabetan pedang musuh demi melindungi nyawa suci Rasulullah di tengah kekacauan perang Uhud.',
        query: 'Uraikan kisah kepahlawanan Nusaibah binti Ka\'ab (Ummu Umarah), keikutsertaannya dalam Baiat Aqabah Kedua, heroisme luar biasa di medan perang Uhud yang menderita belasan luka pedang dan panah demi membentengi nabi, serta perang Yamamah.'
      },
      {
        title: 'Rabi\'ah Al-Adawiyah (Cinta Suci Sufi Klasik)',
        desc: 'Pelopor konsep ibadah Mahabbah Ilahiyah, mencintai Allah murni tanpa mengharap surga dan takut neraka.',
        query: 'Uraikan biografi Rabi\'ah Al-Adawiyah, perjalanan hidupnya dari budak sahaya yang dibebaskan hingga menjadi sufi besar, falsafah cinta tulusnya (Mahabbah) kepada Allah, serta bait-bait puisi spiritualnya yang menggugah jiwa.'
      }
    ]
  },
  {
    id: 'imam-mazhab-ulama-fiqih',
    title: '4 Imam Mazhab & Ulama Fiqih',
    subtitle: 'Tiang-Tiang Hukum Syariat Islam',
    arabicTitle: 'الْأَئِمَّةُ الْأَرْبَعَةُ مُؤَسِّسُو الْمَذَاهِبِ',
    description: 'Riwayat hidup penuh perjuangan dari empat imam mazhab fiqih agung serta kontribusi karya-karya kitab klasik rujukan utama umat islam di seluruh dunia.',
    bannerBg: 'bg-gradient-to-br from-[#10304e] via-[#05192c] to-slate-900',
    borderColor: 'border-[#10304e]/50',
    iconBg: 'bg-blue-950/50 border border-blue-500/45',
    iconColor: 'text-blue-400',
    glowColor: 'shadow-blue-900/30',
    icon: BookOpen,
    items: [
      {
        title: 'Imam Abu Hanifah (Pendiri Mazhab Hanafi)',
        desc: 'Pelopor ijtihad analogi (Qiyas) yang cerdas, ahli hukum rasional yang juga pedagang sutra berintegritas tinggi.',
        query: 'Uraikan biografi lengkap Imam Abu Hanifah (Nu\'man bin Tsabit), masa kehidupannya bersama para tabiin, pengembangan metode fiqih ra\'yi (rasional), ketegasan menolak jabatan hakim kerajaan hingga dipenjara, dan manhaj mazhab Hanafi.'
      },
      {
        title: 'Imam Malik bin Anas (Pendiri Mazhab Maliki)',
        desc: 'Imam Darul Hijrah Madinah, penjaga tradisi amalan penduduk kota nabi, and penulis kitab fiqih-hadits tertua "Al-Muwatta".',
        query: 'Uraikan biografi lengkap Imam Malik bin Anas, kecintaannya yang agung terhadap hadits nabi (tidak mau naik kendaraan di Madinah), penyusunan kitab monumental Al-Muwatta, metodologi mazhab Maliki, and keteguhannya menghadapi fitnah penguasa.'
      },
      {
        title: 'Imam Asy-Syafi\'i (Pendiri Mazhab Syafi\'i)',
        desc: 'Pembela Sunnah, pencetus ilmu Ushul Fiqih pertama di dunia lewat kitab "Ar-Risalah", mazhab mayoritas Nusantara.',
        query: 'Uraikan biografi lengkap Imam Muhammad bin Idris Asy-Syafi\'i, kecerdasannya menghafal Al-Quran dan Al-Muwatta di usia belia, pengembaraan menuntut ilmu di Makkah, Madinah, Irak, Mesir, penulisan kitab Al-Umm dan Ar-Risalah, serta Qaul Qadim and Qaul Jadid.'
      },
      {
        title: 'Imam Ahmad bin Hanbal (Pendiri Mazhab Hambali)',
        desc: 'Imam Ahlussunnah penyusun kitab Musnad berkapasitas puluhan ribu hadits, terkenal dengan keteguhan hati menghadapi cobaan ujian akidah.',
        query: 'Uraikan biografi lengkap Imam Ahmad bin Hanbal, keteguhannya mempertahankan keyakinan bahwa Al-Quran adalah Kalamullah (bukan makhluk) dalam peristiwa Mihnah, penyusunan Musnad Ahmad, kesederhanaan hidupnya, serta dasar manhaj Hambali.'
      }
    ]
  },
  {
    id: 'muhaddatsin-perawi-hadits',
    title: 'Para Penghafal & Perawi Hadits',
    subtitle: 'Penjaga Kemurnian Sunnah Rasulullah',
    arabicTitle: 'أَئِمَّةُ الْحَدِيثِ النَّبَوِيِّ الشَّرِيفِ',
    description: 'Perjalanan hidup luar biasa para imam Muhadditsin dalam mengarungi ribuan mil, menghafal, dan menyaring hadits-hadits nabi secara super ketat.',
    bannerBg: 'bg-gradient-to-br from-[#1c4d44] via-[#0b2923] to-slate-900',
    borderColor: 'border-teal-500/30',
    iconBg: 'bg-teal-950/50 border border-teal-500/45',
    iconColor: 'text-teal-400',
    glowColor: 'shadow-teal-900/30',
    icon: Scroll,
    items: [
      {
        title: 'Imam Al-Bukhari (Amirul Mukminin fil Hadits)',
        desc: 'Penyusun kitab tersahih pasca Al-Quran "Shahih Al-Bukhari", pengembara bermata batin tajam and berdaya ingat fotografis.',
        query: 'Uraikan biografi lengkap Imam Muhammad bin Ismail Al-Bukhari, kisah kesembuhan matanya sewaktu kecil berkat doa ibunya, pengembaraan mencari hadits, kekuatan hafalannya, proses penulisan kitab Al-Jami\' as-Shahih, dan ujian hidupnya di akhir hayat.'
      },
      {
        title: 'Imam Muslim (Sistematika Penulisan Terbaik)',
        desc: 'Murid setia Bukhari penyusun "Shahih Muslim" dengan kaidah klasifikasi hadits paling sistematis dan metodologi ketat.',
        query: 'Uraikan biografi lengkap Imam Muslim bin Al-Hajjaj, hubungannya dengan gurunya Imam Bukhari, penyusunan kitab Shahih Muslim, keunggulan sistematika bab dan sanadnya, serta kontribusinya bagi keilmuan hadits.'
      },
      {
        title: 'Imam Abu Dawud (Pakar Hadits Hukum)',
        desc: 'Ulama hadits yang menyaring ratusan ribu riwayat menjadi "Sunan Abu Dawud" yang fokus mendasari ijtihad hukum fikih.',
        query: 'Uraikan biografi lengkap Imam Abu Dawud As-Sijistani, pengembaraannya mengumpulkan hadits, penyusunan kitab Sunan Abu Dawud, penilaiannya terhadap derajat kekuatan hadits, and pujian para ulama terhadap integritas pribadinya.'
      },
      {
        title: 'Imam At-Tirmidzi (Pencetus Istilah Hadits Hasan)',
        desc: 'Murid Bukhari bermata buta yang memiliki ketajaman hati, penyusun "Jami At-Tirmidzi" and pelopor istilah hadits Hasan.',
        query: 'Uraikan biografi lengkap Imam Abu Isa At-Tirmidzi, kekuatan hafalan rekamannya yang menakjubkan, penyusunan kitab Sunan/Jami At-Tirmidzi, penulisan kitab Al-Syamail Al-Muhammadiyyah (sifat mulia nabi), serta jasanya merumuskan hadits Hasan.'
      },
      {
        title: 'Imam An-Nasa\'i (Ketelitian Verifikasi Sanad)',
        desc: 'Penulis kitab "Sunan An-Nasa\'i" yang memiliki syarat penyaringan sanad paling ketat setelah dua kitab Shahih.',
        query: 'Uraikan biografi lengkap Imam Ahmad bin Syu\'aib An-Nasa\'i, kezuhudan hidupnya di Mesir, ketelitiannya yang luar biasa dalam menyeleksi para perawi hadits (Rijalul Hadits), penyusunan Sunan Al-Kubra dan Al-Mujtaba, serta kisah syahidnya.'
      },
      {
        title: 'Imam Ibnu Majah (Pelengkap Kutubus Sittah)',
        desc: 'Penyempurna jajaran enam kitab rujukan hadits utama, ahli tafsir dan sejarah dari bumi Qazwin.',
        query: 'Uraikan biografi lengkap Imam Ibnu Majah (Abu Abdillah Muhammad bin Yazid), perjalanannya mengarungi pusat ilmu keislaman, penyusunan kitab Sunan Ibnu Majah, keindahan sistematikanya, serta statusnya melengkapi Kutubus Sittah.'
      }
    ]
  },
  {
    id: 'peninggalan-kebudayaan-seni',
    title: 'Peninggalan, Seni & Kebudayaan',
    subtitle: 'Khazanah Situs Suci, Arsitektur & Kaligrafi',
    arabicTitle: 'الآثَارُ وَالْفُنُونُ وَالْمَخْطُوطَاتُ الْإِسْلَامِيَّةُ',
    description: 'Menelusuri sejarah kebesaran Islam lewat situs bersejarah tiga masjid suci, evolusi arsitektur bangunan, seni kaligrafi khat, serta manuskrip ilmiah.',
    bannerBg: 'bg-gradient-to-br from-[#4d381c] via-[#2a1d0d] to-slate-900',
    borderColor: 'border-amber-600/30',
    iconBg: 'bg-amber-950/50 border border-amber-600/45',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-900/30',
    icon: Sparkles,
    items: [
      {
        title: 'Sejarah Tiga Masjid Suci Umat Islam',
        desc: 'Pondasi pembangunan, perluasan lintas zaman, and rahasia spiritual Masjidil Haram, Masjid Nabawi, dan Masjid Al-Aqsa.',
        query: 'Uraikan sejarah lengkap pembangunan dan renovasi lintas dinasti kekhalifahan dari Tiga Masjid Suci (Masjidil Haram di Makkah, Masjid Nabawi di Madinah, dan Masjid Al-Aqsa di Yerusalem), keutamaan beribadah di dalamnya, serta rahasia arsitekturnya.'
      },
      {
        title: 'Keajaiban Hagia Sophia & Istana Alhambra',
        desc: 'Simbol transformasi peradaban Istanbul dari katedral menjadi masjid agung, and kemegahan istana seni ukir islam di Spanyol.',
        query: 'Uraikan sejarah arsitektur and politik di balik konversi Hagia Sophia di Istanbul oleh Sultan Muhammad Al-Fatih, keunikan kaligrafi di dalamnya, serta sejarah pembangunan istana Alhambra di Granada Spanyol sebagai puncak estetika arsitektur Islam Barat.'
      },
      {
        title: 'Manuskrip Kitab Klasik Berpengaruh (Turats)',
        desc: 'Sejarah penulisan karya sains "Al-Qanun fi at-Tibb", teori sosiologi "Muqaddimah", hingga tasawuf "Ihya Ulumuddin".',
        query: 'Uraikan latar belakang penulisan, pengaruh ilmiah, and nilai historis dari manuskrip kitab-kitab klasik paling berpengaruh di dunia islam: Ihya Ulumuddin karya Imam Al-Ghazali, Muqaddimah karya Ibnu Khaldun, and Al-Qanun fi at-Tibb karya Ibnu Sina.'
      },
      {
        title: 'Evolusi Arsitektur Masjid Lintas Zaman',
        desc: 'Perkembangan rancang bangun masjid dari bentuk dinding kurma sederhana era sahabat hingga kemegahan kubah-menara.',
        query: 'Uraikan evolusi sejarah arsitektur masjid dari masa Masjid Nabawi pertama yang beratapkan daun kurma, pengaruh arsitektur Romawi-Persia pada Dinasti Umayyah, kubah bawang Mughal, hingga gaya menara pensil Kesultanan Utsmaniyah.'
      },
      {
        title: 'Seni Kaligrafi Islam (Khat Arab)',
        desc: 'Sejarah keindahan estetika khat Naskhi, Tsuluts, Diwani, Kufi, and perannya sebagai hiasan agung kalamullah.',
        query: 'Uraikan sejarah perkembangan seni kaligrafi (Khat Arab) dalam peradaban Islam, ciri khas keindahan visual masing-masing aliran (Kufi yang geometris, Naskhi yang luwes, Tsuluts yang megah, Diwani yang dekoratif), serta para maestro legendarisnya.'
      }
    ]
  },
  {
    id: 'peradaban-geografi',
    title: 'Peradaban, Geografi & Perdagangan',
    subtitle: 'Universitas Tertua & Ekspansi Dakwah Damai',
    arabicTitle: 'الْحَضَارَةُ وَالْمَعْرِفَةُ وَالْجُغْرَافِيَا الْإِسْلَامِيَّةُ',
    description: 'Saksi bisu perkembangan peradaban Islam melalui lahirnya universitas tertua di dunia, peta sains Al-Idrisi, serta jalur niaga sutra dan rempah.',
    bannerBg: 'bg-gradient-to-br from-[#12393d] via-[#081e21] to-slate-900',
    borderColor: 'border-cyan-500/30',
    iconBg: 'bg-cyan-950/50 border border-cyan-500/45',
    iconColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-900/30',
    icon: Compass,
    items: [
      {
        title: 'Universitas Al-Qarawiyyin Maroko (Tertua di Dunia)',
        desc: 'Didirikan oleh wanita mulia Fatima al-Fihri pada tahun 859 M, universitas pemberi gelar akademik tertua di muka bumi.',
        query: 'Uraikan sejarah berdirinya Universitas Al-Qarawiyyin di Fez Maroko oleh Fatima al-Fihri, peranannya sebagai pelopor universitas modern pertama di dunia, lulusan-lulusan non-muslim bersejarah, serta warisan perpustakaan klasiknya.'
      },
      {
        title: 'Universitas Al-Azhar & Bayt al-Hikmah Baghdad',
        desc: 'Sejarah berdirinya mercusuar keilmuan Islam Al-Azhar di Kairo serta pusat penerjemahan sains Bayt al-Hikmah di Baghdad.',
        query: 'Uraikan sejarah berdirinya perpustakaan raksasa Bayt al-Hikmah di Baghdad pada masa Abbasiyah sebagai pusat sains dunia, berdampingan dengan sejarah berdirinya Universitas Al-Azhar di Kairo Mesir oleh dinasti Fatimiyah hingga menjadi rujukan dunia islam.'
      },
      {
        title: 'Ekspedisi Damai Laksamana Cheng Ho',
        desc: 'Pelayaran armada maritim terbesar asal Tiongkok, menyebarkan persahabatan, asimilasi budaya, and dakwah di Asia Tenggara.',
        query: 'Uraikan sejarah perjalanan ekspedisi laut Laksamana Cheng Ho (Zheng He), skala armada raksasanya, misi perdamaian dan perdagangan, serta perannya yang sangat besar dalam membantu asimilasi dan penyebaran Islam di pesisir Nusantara.'
      },
      {
        title: 'Jalur Sutra & Jalur Rempah Dunia Islam',
        desc: 'Bagaimana para saudagar muslim menyebarkan dakwah toleran melintasi gurun Asia Tengah hingga pesisir kepulauan nusantara.',
        query: 'Uraikan peran strategis para pedagang muslim dalam penyebaran agama Islam secara damai melalui Jalur Sutra (darat melintasi Asia Tengah-Tiongkok) and Jalur Rempah (laut melintasi pesisir India, Gujarat, Selat Malaka, hingga Kepulauan Nusantara).'
      },
      {
        title: 'Peta Dunia Al-Idrisi (Kartografi Abad Pertengahan)',
        desc: 'Penciptaan globe perak and peta bola dunia paling akurat abad pertengahan oleh ilmuwan muslim untuk raja Kristen Sisilia.',
        query: 'Uraikan biografi Syarif Al-Idrisi, proyek ilmiah pembuatan peta dunia "Tabula Rogeriana" and globe perak atas sponsor Raja Roger II dari Sisilia, serta keakuratan geografisnya yang memandu navigasi pelayaran dunia.'
      }
    ]
  },
  {
    id: 'gerakan-pembaharuan-modern',
    title: 'Gerakan Pembaharuan & Modern',
    subtitle: 'Kebangkitan Ormas & Pahlawan Pendidikan Islam',
    arabicTitle: 'الْحَرَكَاتُ الْإِصْلَاحِيَّةُ وَالْجَمْعِيَّاتُ الْإِسْلَامِيَّةُ',
    description: 'Sejarah gerakan pemikiran pembaharu Islam dunia, perjuangan pahlawan kemerdekaan Nusantara, serta berdirinya ormas-ormas Islam terbesar.',
    bannerBg: 'bg-gradient-to-br from-[#103d3c] via-[#051e1d] to-slate-900',
    borderColor: 'border-emerald-600/30',
    iconBg: 'bg-emerald-950/50 border border-emerald-600/45',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-900/30',
    icon: Users,
    items: [
      {
        title: 'Tokoh Pembaharu Islam Dunia: Al-Afghani & Abduh',
        desc: 'Gerakan pembaharuan pemikiran, perlawanan terhadap kolonialisme barat, and pemurnian akidah umat.',
        query: 'Uraikan sejarah gerakan pembaharuan Islam (Tajdid) abad ke-19 yang dimotori oleh Jamaluddin Al-Afghani dan Muhammad Abduh di Mesir, konsep Pan-Islamisme, pembaharuan kurikulum Al-Azhar, serta dampaknya bagi kebangkitan intelektual dunia muslim.'
      },
      {
        title: 'KH Hasyim Asy\'ari & Resolusi Jihad Nahdlatul Ulama',
        desc: 'Hadratussyaikh pendiri NU, benteng pertahanan akidah Ahlussunnah wal Jama\'ah, and penggerak perang kemerdekaan Indonesia.',
        query: 'Uraikan biografi lengkap Hadratussyaikh KH Hasyim Asy\'ari, pendirian organisasi Nahdlatul Ulama (NU) tahun 1926, keteguhan sikap non-kooperatifnya terhadap penjajah Jepang/Belanda, serta pencetusan fatwa Resolusi Jihad 22 Oktober 1945.'
      },
      {
        title: 'KH Ahmad Dahlan & Tajdid Dakwah Muhammadiyah',
        desc: 'Pelopor pembaruan dakwah islam melalui perintisan sekolah modern, panti asuhan, and pelayanan kesehatan masyarakat.',
        query: 'Uraikan biografi lengkap KH Ahmad Dahlan (Muhammad Darwis), pendirian persyarikatan Muhammadiyah tahun 1912 di Yogyakarta, ide pembaharuan dakwah praktis, pelurusan arah kiblat, serta modernisasi lembaga pendidikan islam.'
      },
      {
        title: 'H.O.S. Tjokroaminoto & Syarikat Islam',
        desc: 'Raja tanpa mahkota guru para pendiri bangsa, penggerak kesadaran politik nasional pertama berbasis keislaman massal.',
        query: 'Uraikan biografi H.O.S. Tjokroaminoto, transformasi Sarekat Dagang Islam (SDI) menjadi Sarekat Islam (SI), taktik kepemimpinannya mengonsolidasi jutaan anggota, serta didikannya yang melahirkan ideologi tokoh-tokoh kemerdekaan Indonesia.'
      },
      {
        title: 'Sejarah Ormas Islam Pelopor Kemerdekaan',
        desc: 'Sinergi organisasi Islam NU, Muhammadiyah, Persis, Syarikat Islam, Al-Irsyad dalam mencerdaskan bangsa and merebut kemerdekaan.',
        query: 'Uraikan sejarah berdirinya ormas-ormas Islam besar di Indonesia (Muhammadiyah, NU, Persatuan Islam/Persis, Al-Irsyad Al-Islamiyyah, Al-Washliyah), kontribusinya dalam pendidikan kepemudaan, perjuangan fisik, and penyusunan naskah kemerdekaan Pancasila.'
      }
    ]
  },
  {
    id: 'teologi-ilmu-kalam',
    title: 'Teologi & Mazhab Aqidah (Ilmu Kalam)',
    subtitle: 'Sejarah Munculnya Aliran Pemikiran Islam',
    arabicTitle: 'عِلْمُ الْكَلَامِ وَالْمَذَاهِبُ الْعَقَدِيَّةُ فِي التَّارِيخِ',
    description: 'Mempelajari sejarah terbentuknya pemikiran teologi Islam, lahirnya akidah Ahlussunnah wal Jama\'ah (Asy\'ariyah-Maturidiyah) serta dinamika sekte-sekte lainnya.',
    bannerBg: 'bg-gradient-to-br from-[#123a4a] via-[#081a22] to-slate-905',
    borderColor: 'border-blue-600/30',
    iconBg: 'bg-blue-950/50 border border-blue-600/45',
    iconColor: 'text-blue-400',
    glowColor: 'shadow-blue-900/30',
    icon: BookOpenCheck,
    items: [
      {
        title: 'Sejarah Akidah Ahlussunnah wal Jama\'ah (Aswaja)',
        desc: 'Formulasi teologi moderat oleh Imam Abu al-Hasan al-Asy\'ari and Imam Abu Mansur al-Maturidi pembela Sunnah nabi.',
        query: 'Uraikan sejarah terbentuknya mazhab akidah Ahlussunnah wal Jama\'ah (Asy\'ariyah dan Maturidiyah), biografi Imam Abu al-Hasan al-Asy\'ari yang keluar dari Mu\'tazilah, biografi Imam Abu Mansur al-Maturidi, and konsep teologi moderat (Sifat 20, takdir Kasb) yang dianut mayoritas umat Islam.'
      },
      {
        title: 'Munculnya Sekte Awal: Khawarij & Syi\'ah',
        desc: 'Bagaimana perpecahan politik pasca wafatnya Sayyidina Utsman and peristiwa Tahkim merembet menjadi dogma teologis ekstrem.',
        query: 'Uraikan latar belakang sejarah kemunculan aliran Khawarij (kelompok yang keluar dari barisan) and Syi\'ah (pembela Sayyidina Ali), akar konflik politik pasca perang Siffin dan peristiwa Tahkim, serta perkembangan doktrin teologi awal mereka.'
      },
      {
        title: 'Aliran Kalam: Mu\'tazilah, Jabariyah & Qadariyah',
        desc: 'Polemik akal versus wahyu, kebebasan berkehendak manusia, and status keadilan tuhan di masa dinasti Abbasiyah.',
        query: 'Uraikan doktrin pemikiran teologi aliran Mu\'tazilah (rasionalisme ekstrem), Jabariyah (fatalisme pasrah), and Qadariyah (kehendak bebas manusia), perdebatan sengit mereka di panggung sejarah ilmu kalam, serta bagaimana Aswaja berdiri menengahi aliran-aliran tersebut.'
      },
      {
        title: 'Gerakan Wahabi di Jazirah Arab (Abad ke-18)',
        desc: 'Dakwah pemurnian tauhid dari Muhammad bin Abdul Wahhab, aliansi politik dengan Ibnu Saud, and pembentukan Arab Saudi.',
        query: 'Uraikan sejarah kemunculan gerakan Wahabi (Salafi Dakwah) yang dirintis oleh Muhammad bin Abdul Wahhab di wilayah Najd abad ke-18, doktrin utamanya mengenai pemurnian tauhid dari kuburan/bid\'ah, aliansi dinasti Saud, serta dampaknya pada geopolitik Jazirah Arab.'
      },
      {
        title: 'Peristiwa Mihnah (Fitnah Al-Quran Makhluk)',
        desc: 'Ujian keteguhan iman di mana para ulama disiksa demi menuruti dogma penguasa, dipelopori keteguhan Imam Ahmad bin Hanbal.',
        query: 'Uraikan sejarah tragedi kemanusiaan "Mihnah" (Inkuisisi Fitnah Al-Quran adalah Makhluk) pada masa dinasti Abbasiyah (khalifah Al-Ma\'mun, Al-Mu\'tashim, Al-Watsiq), heroisme keteguhan Imam Ahmad bin Hanbal menolak dogma tersebut demi menjaga akidah bahwa Al-Quran adalah Kalamullah, hingga berakhirnya Mihnah di era Al-Mutawakkil.'
      }
    ]
  },
  {
    id: 'tasawuf-wali-allah',
    title: 'Tasawuf & Wali Allah (Auliya)',
    subtitle: 'Pembersih Jiwa & Karamah Kekasih Allah',
    arabicTitle: 'عِلْمُ التَّصَوُّفِ وَسِيَرُ أَوْلِيَاءِ اللَّهِ الصَّالِحِينَ',
    description: 'Kisah kezuhudan para tokoh tasawuf klasik, fenomena karamah wali Allah di luar nalar manusia, serta silsilah sejarah tarekat-tarekat besar.',
    bannerBg: 'bg-gradient-to-br from-[#124233] via-[#081e17] to-slate-900',
    borderColor: 'border-emerald-600/30',
    iconBg: 'bg-emerald-950/50 border border-emerald-600/45',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-900/30',
    icon: Heart,
    items: [
      {
        title: 'Syekh Abdul Qadir al-Jilani (Sulthanul Auliya)',
        desc: 'Raja para wali kekasih Allah, tokoh fiqih hambali yang mencapai puncak maqam tazkiyatun nafs (pembersihan jiwa).',
        query: 'Uraikan biografi lengkap Syekh Abdul Qadir al-Jilani, silsilah keturunannya, masa belajarnya di Baghdad, penggabungan ilmu syariat dan tasawuf, nasihat-nasihat rohaninya dalam kitab Futuhul Ghaib dan Al-Fathur Rabbani, serta kesalehannya yang diakui dunia islam.'
      },
      {
        title: 'Sufi Klasik: Hasan al-Basri & Uwais al-Qarni',
        desc: 'Uwais, sosok pemuda yatim berbakti yang tak dikenal bumi namun masyhur di langit, and petuah kezuhudan Hasan al-Basri.',
        query: 'Uraikan biografi kehidupan Uwais al-Qarni, baktinya yang luar biasa pada ibunya yang buta lumpuh, tanda-tanda fisik yang disebutkan Rasulullah kepada Umar dan Ali, serta biografi kezuhudan Imam Hasan al-Basri mendinginkan gejolak duniawi di Basrah.'
      },
      {
        title: 'Karamah Para Wali Allah (Tinjauan Ilmiah)',
        desc: 'Kedudukan karamah para kekasih Allah di luar hukum alam, perbedaannya dengan mukjizat, sihir, and penjelasannya sesuai Aswaja.',
        query: 'Uraikan konsep kebenaran adanya Karamah para Wali Allah berdasarkan dalil Al-Quran (kisah Ashabul Kahfi, Maryam, asif bin Barkhiya) and Hadits shahih, perbedaan teologis antara Mukjizat (Nabi), Karamah (Wali), Ma\'unah (Mukmin saleh), Istidraj (Pendosa), serta batasan-batasan syariat dalam tasawuf.'
      },
      {
        title: 'Sejarah Tarekat-Tarekat Besar Dunia',
        desc: 'Silsilah spiritual, wirid, and sejarah perkembangan Tarekat Qadiriyah, Naqsyabandiyah, Syadziliyah, and Rifa\'iyah.',
        query: 'Uraikan sejarah berdirinya tarekat-tarekat mu\'tabarah (tarekat yang bersambung sanadnya ke Rasulullah), silsilah rohani, ajaran tazkiyah, and perkembangan dunia dari: Tarekat Qadiriyah (Syekh Abdul Qadir), Naqsyabandiyah (Syekh Bahauddin), Syadziliyah (Syekh Abu Hasan Asy-Syadzili), and Mawlawiyah (Jalaluddin Rumi).'
      }
    ]
  },
  {
    id: 'qashashul-quran',
    title: 'Kisah-Kisah dalam Al-Qur\'an',
    subtitle: 'Pelajaran Berharga dari Tokoh & Kaum Terdahulu',
    arabicTitle: 'قَصَصُ الْقُرْآنِ الْكَرِيمِ وَالْعِبَرُ',
    description: 'Kisah-kisah menakjubkan di luar riwayat 25 nabi yang diabadikan dalam ayat suci Al-Qur\'an tentang kaum, tempat, dan tokoh penting masa lalu.',
    bannerBg: 'bg-gradient-to-br from-[#4e3a15] via-[#2d2109] to-slate-900',
    borderColor: 'border-amber-600/30',
    iconBg: 'bg-amber-950/50 border border-amber-600/45',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-900/30',
    icon: BookOpen,
    items: [
      {
        title: 'Luqman al-Hakim (Parenting Hikmah)',
        desc: 'Hamba saleh bukan nabi yang dianugerahi mutiara kebijaksanaan luhur mendidik anak tentang tauhid, adab, and akhlak.',
        query: 'Uraikan kisah Luqman al-Hakim sesuai Surah Luqman di Al-Quran, rahasia di balik penamaan "Al-Hakim" (pemilik hikmah), kandungan rincian wasiat emasnya kepada anaknya mengenai tauhid, menjauhi kesombongan, adab berinteraksi, dan berbakti kepada orang tua.'
      },
      {
        title: 'Kisah Pertemuan Nabi Musa & Nabi Khidir AS',
        desc: 'Perjalanan penuh teka-teki takdir yang meruntuhkan kesombongan ilmu manusia, mengajarkan rahasia kebijaksanaan ilahi.',
        query: 'Uraikan kisah lengkap pertemuan Nabi Musa AS dan Nabi Khidir AS dalam Surah Al-Kahfi, perjalanan menuntut ilmu spiritual, tiga tindakan Khidir yang kontroversial bagi akal zahir (melubangi perahu, membunuh anak kecil, membangun dinding), serta hikmah takdir di baliknya.'
      },
      {
        title: 'Zulkarnain & Benteng Yakjuj Makjuj',
        desc: 'Raja adil pembela tauhid yang mengurung kaum perusak bumi di balik benteng tembaga besi raksasa.',
        query: 'Uraikan kisah kepemimpinan Zulkarnain (Raja Adil Penakluk Dunia) dalam Al-Quran, ekspedisi perjalanannya ke barat, timur, dan sela dua gunung, pembagunan tembok raksasa dari besi dan tembaga cair untuk menahan Yakjuj dan Makjuj, serta hikmah kepemimpinannya.'
      },
      {
        title: 'Ashabul Kahfi (Tujuh Pemuda dalam Gua)',
        desc: 'Mukjizat pelarian demi menyelamatkan iman dari penguasa kejam hingga tertidur lelap melintasi tiga abad.',
        query: 'Uraikan kisah lengkap Ashabul Kahfi (Tujuh Pemuda dan seekor anjing) yang melarikan diri dari kejaran Kaisar Diqyanus demi menjaga tauhid, mukjizat ditidurkan Allah di dalam gua selama 309 tahun Hijriah, peristiwa terbangunnya mereka di era raja beriman, and ibrah keimanannya.'
      },
      {
        title: 'Runtuhnya Peradaban Kaum Aad, Tsamud & Saba',
        desc: 'Peringatan keras hancurnya kota-kota megah akibat kesombongan teknologi, kekayaan, and berpaling dari rasa syukur.',
        query: 'Uraikan sejarah kehancuran kaum-kaum masa lalu yang diabadikan dalam Al-Quran: Kaum \'Ad (kaum Nabi Hud) yang perkasa, Kaum Tsamud (kaum Nabi Saleh) pemahat gunung, dan kaum Saba (negeri penuh berkah) yang dilanda banjir bandang Arim akibat mendustakan nikmat Allah.'
      },
      {
        title: 'Tokoh Antagonis Al-Quran: Qarun, Haman & Samiri',
        desc: 'Ibrah buruk akibat kesombongan harta melimpah (Qarun), tirani birokrasi jahat (Haman), and penyesatan akidah lembu emas (Samiri).',
        query: 'Uraikan kisah tragis tiga tokoh antagonis dalam Al-Quran beserta hikmah buruknya bagi umat manusia: Qarun yang sombong dengan harta kuncinya hingga ditelan bumi, Haman mentri pelaksana kelaliman Firaun, dan Samiri pembuat patung anak sapi emas penyesat Bani Israil.'
      }
    ]
  },
  {
    id: 'qashash-al-hadits',
    title: 'Kisah-Kisah dalam Hadits',
    subtitle: 'Amsal & Kejadian Autentik Lisan Rasulullah',
    arabicTitle: 'الْقَصَصُ الصَّحِيحَةُ مِنَ الْأَحَادِيثِ النَّبَوِيَّةِ',
    description: 'Cerita-cerita sahih penyubur iman yang disampaikan langsung oleh Rasulullah SAW mengenai kehidupan umat terdahulu sebagai tamsil kehidupan.',
    bannerBg: 'bg-gradient-to-br from-[#124d45] via-[#082924] to-slate-905',
    borderColor: 'border-teal-500/30',
    iconBg: 'bg-teal-950/50 border border-teal-500/45',
    iconColor: 'text-teal-400',
    glowColor: 'shadow-teal-900/30',
    icon: Scroll,
    items: [
      {
        title: 'Kisah 3 Orang yang Terjebak di Dalam Gua',
        desc: 'Tertutup batu raksasa tanpa harapan, selamat berkat wasilah doa menyebutkan amal paling ikhlas demi orang tua and kesucian diri.',
        query: 'Uraikan kisah shahih tiga orang musafir Bani Israil yang berteduh di gua lalu tertutup batu besar menggelinding, kepasrahan mereka bertawasul dengan amal saleh paling ikhlas (berbakti pada orang tua, menjauhi zina, menunaikan hak upah pekerja), hingga batu bergeser atas izin Allah.'
      },
      {
        title: 'Kisah Pria Pembunuh 99 Nyawa Mencari Taubat',
        desc: 'Perjalanan taubat tulus pria yang menggenapkan korbannya menjadi 100, diampuni Allah karena melangkah menuju tanah hijrah.',
        query: 'Uraikan kisah shahih hadits nabi tentang seorang pembunuh 99 nyawa yang ingin bertaubat, pembunuhan rahib yang melengkapi korbannya jadi 100, petunjuk ulama menyuruhnya berhijrah ke desa saleh, kematiannya di tengah jalan, and pertikaian malaikat azab-rahmat yang dimenangkan rahmat Allah.'
      },
      {
        title: 'Juraij - Ahli Ibadah yang Difitnah Wanita Pezina',
        desc: 'Ujian keteguhan hati di mana doa ibunya yang terluka berujung fitnah keji, diselamatkan oleh mukjizat bayi merah berbicara membela kesuciannya.',
        query: 'Uraikan kisah hadits sahih mengenai Juraij, ahli ibadah yang mengutamakan shalat sunnah dibanding panggilan ibunya hingga ibunya berdoa agar dia diuji, fitnah wanita pelacur menuduhnya menghamili, perusakan mihrabnya oleh massa, and keajaiban bayi berbicara menunjuk ayah kandungnya.'
      },
      {
        title: 'Ujian Tiga Orang Bani Israil: Kusta, Botak & Buta',
        desc: 'Malaikat menyamar menguji rasa syukur atas karunia penyembuhan penyakit and kelimpahan harta ternak kambing, sapi, and unta.',
        query: 'Uraikan kisah hadits shahih tentang tiga orang penderita kusta, botak, dan buta dari Bani Israil yang disembuhkan penyakitnya dan diberi kemakmuran harta melimpah oleh Allah melalui perantara malaikat, serta bagaimana kelakuan kikir si kusta dan botak dibanding kesalehan si buta.'
      },
      {
        title: 'Metodologi Penyaringan Kisah Israiliyyat',
        desc: 'Bagaimana ulama tafsir Aswaja menyikapi riwayat tambahan dari ahli kitab, kaidah penyaringan ketat, and batasan yang diperbolehkan.',
        query: 'Uraikan pandangan ulama ahli hadits dan tafsir Ahlussunnah wal Jama\'ah mengenai periwayatan Kisah Israiliyyat, pembagian derajatnya (yang disetujui syariat, didustakan, and didiamkan), sabda Rasulullah "Hadditsu \'an Bani Israil wa la haraj", serta kehati-hatian mengutipnya.'
      }
    ]
  },
  {
    id: 'hikmah-folklore-lokal',
    title: 'Kisah Hikmah & Folklore Lokal',
    subtitle: 'Anekdot Abu Nawas & Akulturasi Budaya',
    arabicTitle: 'الْقَصَصُ الشَّعْبِيَّةُ وَالْحِكَمُ النُّوسَانْتَارِيَّةُ',
    description: 'Dongeng jenaka penuh satir hikmah dari era Abbasiyah serta sejarah akulturasi budaya dakwah yang melahirkan kearifan lokal Nusantara.',
    bannerBg: 'bg-gradient-to-br from-[#402a12] via-[#211508] to-slate-900',
    borderColor: 'border-amber-700/30',
    iconBg: 'bg-amber-950/50 border border-amber-700/45',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-900/30',
    icon: Sparkles,
    items: [
      {
        title: 'Anekdot Abu Nawas & Nasruddin Hoja',
        desc: 'Kisah jenaka penuh kelucuan, satir tajam, and hikmah kebijaksanaan menyentil kesombongan kekuasaan di istana Khalifah.',
        query: 'Uraikan kisah-kisah hikmah legendaris Abu Nawas (Abu Nuwas) di istana Harun Ar-Rasyid Baghdad dan Nasruddin Hoja, pesan-pesan moral, kecerdikan logika memecahkan masalah mustahil, serta bagaimana humor digunakan sebagai sarana penyampai kebenaran yang santun.'
      },
      {
        title: 'Akulturasi Budaya Dakwah Sunan Kalijaga',
        desc: 'Strategi asimilasi kreatif pementasan wayang kulit, sekaten, tahlilan, slametan yang melarutkan tauhid tanpa kekerasan.',
        query: 'Uraikan sejarah dakwah kultural Sunan Kalijaga dalam melestarikan tradisi lokal Jawa, reformasi tokoh pewayangan (Kala ditransformasi menjadi Kalimah Syahadat/Jamus Kalimasada), asal-usul tradisi Sekaten, and bagaimana Islam masuk tanpa merusak kerangka budaya asli.'
      },
      {
        title: 'Kajian Hikmah Babad Tanah Jawi & Hikayat Pasai',
        desc: 'Membedah nilai sejarah, petuah kepemimpinan, dan asimilasi naskah sastra klasik melayu-jawa sebagai penyimpan memori islam.',
        query: 'Uraikan kajian kritis mengenai naskah Babad Tanah Jawi dan Hikayat Raja-Raja Pasai, bagaimana unsur mitologi, sejarah penyebaran islam, dan keteladanan para ulama dikemas dalam karya sastra agung Nusantara, serta hikmah sosiologisnya.'
      }
    ]
  },
  {
    id: 'hari-bersejarah',
    title: 'Hari Bersejarah Islam',
    subtitle: 'Lintasan Peristiwa Agung',
    arabicTitle: 'الْأَيَّامُ التَّارِيخِيَّةُ الْإِسْلَامِيَّةُ',
    description: 'Menelusuri sejarah kebesaran Islam yang terekam pada hari-hari suci, peperangan besar pertahanan akidah, hingga turunnya wahyu mulia.',
    bannerBg: 'bg-gradient-to-br from-[#12314f] via-[#081829] to-slate-905',
    borderColor: 'border-sky-500/30',
    iconBg: 'bg-sky-950/50 border border-sky-500/45',
    iconColor: 'text-sky-400',
    glowColor: 'shadow-sky-900/30',
    icon: Calendar,
    items: [
      {
        title: '1 Muharram (Tahun Baru Islam)',
        desc: 'Momen penting peristiwa Hijrah Rasulullah SAW dan para sahabat dari Makkah ke Madinah penentu kalender Islam Hijriah.',
        query: 'Sejarah lengkap peristiwa Hijrah Rasulullah SAW dan para sahabat dari Makkah ke Madinah yang menjadi dasar utama penetapan Kalender Hijriah 1 Muharram berdasarkan dalil, riwayat shahih, kronologi kejadian, dan rujukan kitab Tarikh Ahlussunnah wal Jama\'ah.'
      },
      {
        title: '9 Muharram (Hari Tasu\'a)',
        desc: 'Hari persiapan sebelum Asyura yang dianjurkan berpuasa guna menyelisihi umat lain, bagian dari sunnah Rasulullah SAW.',
        query: 'Sejarah Hari Tasu\'a (9 Muharram), niat dan keutamaan ibadah puasa Tasu\'a, dan penjelasan bagaimana Rasulullah SAW bertekad menjalankannya demi membedakan serta menyelisihi tradisi puasa kaum Yahudi di Madinah sesuai penjelasan kitab hadits.'
      },
      {
        title: '10 Muharram (Hari Asyura)',
        desc: 'Hari penuh mukjizat di mana Allah menyelamatkan Nabi Musa AS dan menenggelamkan Firaun di Laut Merah.',
        query: 'Sejarah kemuliaan Hari Asyura (10 Muharram), mukjizat diselamatkannya Nabi Musa AS, kesyahidan Sayyidina Husein di Karbala, serta amalan puasa sunnah Asyura berdasarkan dalil, riwayat shahih, and rujukan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: 'Rabu Terakhir Bulan Safar (Tradisi Rebo Wekasan)',
        desc: 'Tradisi tolak bala umat Islam Nusantara di rabu pamungkas bulan Safar dengan shalat sunnah mutlak, doa keselamatan, and sedekah.',
        query: 'Sejarah dan asal-usul tradisi Rebo Wekasan di Nusantara, pandangan ulama thariqah mengenai musibah bulan Safar, tata cara shalat sunnah Lidaf\'il Bala (tolak bala), amalan doa serta pandangan syariat Ahlussunnah wal Jama\'ah terhadap tradisi ini.'
      },
      {
        title: '12 Rabiul Awal (Maulid Nabi SAW)',
        desc: 'Kelahiran agung Sang Pelita Alam, kekasih Allah yang membawa rahmat bagi sekalian alam semesta.',
        query: 'Sejarah lengkap kelahiran Nabi Muhammad SAW (Maulid Nabi), suasana kota Mekkah saat itu, keajaiban-keajaiban yang mengiringinya, dan dalil kegembiraan menyambut maulid berdasarkan dalil, riwayat shahih, dan rujukan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: '10 Rajab (Pembebasan Khaybar)',
        desc: 'Kemenangan gemilang pasukan Islam yang dipimpin Rasulullah SAW meruntuhkan pusat konspirasi musuh di benteng raksasa Khaybar.',
        query: 'Sejarah lengkap peristiwa Pembebasan Khaybar (Ghazwah Khaybar) pada bulan Rajab tahun 7 Hijriah, peran heroik Sayyidina Ali bin Abi Thalib membelah gerbang benteng pertahanan musuh, strategi Rasulullah SAW, serta dampaknya bagi dakwah islam sesuai kitab tarikh.'
      },
      {
        title: '27 Rajab (Isra Mi\'raj Nabi SAW)',
        desc: 'Perjalanan gaib satu malam melintasi dimensi ruang dan waktu menerima syariat shalat 5 waktu langsung dari Allah.',
        query: 'Kisah lengkap perjalanan mukjizat Isra Mi\'raj Nabi Muhammad SAW dari Masjidil Haram ke Masjidil Aqsa hingga naik ke Sidratul Muntaha menerima syariat shalat fardhu berdasarkan dalil, riwayat shahih, dan rujukan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: '15 Sya\'ban (Nisfu Syakban)',
        desc: 'Malam kemuliaan pertengahan bulan Sya\'ban di mana buku catatan amal selama setahun dilaporkan kehadirat Allah SWT.',
        query: 'Sejarah kemuliaan Nisfu Syakban (15 Sya\'ban), tradisi menghidupkan malam nisfu syakban menurut ulama salaf Ahlussunnah wal Jama\'ah, amalan membaca yasin 3 kali dan doa nisfu syakban, serta keutamaannya berdasarkan dalil dan riwayat shahih.'
      },
      {
        title: '17 Ramadhan (Nuzulul Qur\'an)',
        desc: 'Peristiwa diturunkannya wahyu Al-Quran pertama kali kepada Rasulullah SAW melalui malaikat Jibril di Gua Hira.',
        query: 'Sejarah peristiwa agung turunnya Al-Quran (Nuzulul Qur\'an) di malam 17 Ramadhan, penerimaan wahyu pertama Surah Al-Alaq di Gua Hira, serta maknanya bagi peradaban berdasarkan dalil, riwayat shahih, dan rujukan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: '10 Hari Terakhir Ramadhan (Lailatul Qadar)',
        desc: 'Fase klimaks ibadah berburu malam mulia Lailatul Qadar yang keutamaannya lebih baik daripada beribadah seribu bulan.',
        query: 'Sejarah kesungguhan Rasulullah SAW beribadah di sepuluh hari terakhir Ramadhan, rahasia malam Lailatul Qadar pada malam-malam ganjil, amalan i\'tikaf di masjid, serta doa istimewa yang diajarkan Nabi kepada Ibunda Aisyah ra.'
      },
      {
        title: '1 Syawal (Hari Raya Idul Fitri)',
        desc: 'Hari kemenangan suci setelah sebulan penuh berjuang menahan hawa nafsu di bulan Ramadhan.',
        query: 'Sejarah pensyariatan Idul Fitri (1 Syawal), kemenangan batin umat islam setelah puasa Ramadhan, tata cara sunnah menyambut hari raya berdasarkan dalil, riwayat shahih, dan rujukan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: '9 Dzulhijjah (Hari Arafah)',
        desc: 'Puncak ibadah haji berupa wukuf di padang Arafah, hari yang penuh keampunan dan disunnahkan berpuasa bagi yang tidak haji.',
        query: 'Sejarah Hari Arafah (9 Dzulhijjah), kronologi pensyariatan wukuf di Padang Arafah dalam ibadah Haji, keutamaan puasa sunnah Arafah yang menghapus dosa dua tahun, serta amalan dzikir utama hari Arafah berdasarkan dalil dan kitab tarikh.'
      },
      {
        title: '10 Dzulhijjah (Hari Raya Idul Adha)',
        desc: 'Momen ibadah qurban memperingati ketundukan mutlak Nabi Ibrahim dan Ismail kepada perintah Allah.',
        query: 'Sejarah pensyariatan Hari Raya Idul Adha (10 Dzulhijjah) dan ibadah Qurban, teladan kepasrahan keluarga Nabi Ibrahim AS, serta keutamaannya berdasarkan dalil, riwayat shahih, dan rujukan kitab-kitab Ahlussunnah wal Jama\'ah.'
      },
      {
        title: '11, 12, 13 Dzulhijjah (Hari Tasyrik)',
        desc: 'Hari-hari melanjutkan penyembelihan kurban di mana umat Islam dilarang berpuasa dan dianjurkan memperbanyak dzikir.',
        query: 'Sejarah dan hakikat Hari Tasyrik (11, 12, dan 13 Dzulhijjah) pasca Idul Adha, alasan kuat diharamkannya berpuasa pada hari-hari ini, keterkaitannya dengan kelanjutan prosesi penyembelihan hewan qurban, serta anjuran menikmati hidangan disertai senantiasa berdzikir takbiran mengagungkan asma Allah.'
      },
      {
        title: 'Sejarah Puasa Sunnah Senin & Kamis',
        desc: 'Kisah dibalik amalan puasa sunnah mingguan yang rutin dikerjakan oleh Rasulullah SAW karena kemuliaan kedua hari tersebut.',
        query: 'Sejarah dan alasan mendalam Rasulullah SAW rajin mengamalkan puasa sunnah di hari Senin dan Kamis (Senin sebagai hari kelahiran beliau dan diterimanya wahyu pertama; serta kedua hari tersebut sebagai waktu di mana seluruh amal ibadah manusia diperiksa dan diangkat langsung ke hadirat Allah SWT).'
      },
      {
        title: 'Hari Jumat Sayyidul Ayyam',
        desc: 'Hari raya mingguan paling utama bagi umat Islam yang dipenuhi berkah luar biasa dan rentetan sejarah penciptaan.',
        query: 'Sejarah kedudukan hari Jumat sebagai Sayyidul Ayyam (rajanya hari), peristiwa bersejarah penciptaan serta diturunkannya Nabi Adam AS ke bumi pada hari Jumat, kemuliaan ibadah shalat Jumat, serta berbagai tuntunan amalan sunnah di hari penuh berkah ini.'
      },
      {
        title: 'Rahasia Puasa Yaumul Bidh (13, 14, 15 Hijriah)',
        desc: 'Sejarah pensyariatan puasa sunnah tiga hari pertengahan bulan qamariyah di saat bulan purnama bersinar benderang.',
        query: 'Sejarah pensyariatan Puasa Yaumul Bidh (hari-hari putih tanggal 13, 14, dan 15 di setiap bulan Hijriah), wasiat Rasulullah SAW yang menyejajarkan amalan rutin ini dengan pahala puasa sepanjang tahun, serta rahasia hikmah spiritual and fisik berpuasa di waktu pasang bulan purnama.'
      }
    ]
  },
  {
    id: 'kisah-walisongo',
    title: 'Kisah Wali Songo',
    subtitle: 'Dakwah Agung di Nusantara',
    arabicTitle: 'أَوْلِيَاءُ تِسْعَةُ فِي نُوسَانْتَارَا',
    description: 'Kisah sembilan wali agung penyebar cahaya Islam di kepulauan Nusantara yang masyhur dengan metode dakwah kultural, ramah, dan penuh toleransi.',
    bannerBg: 'bg-gradient-to-br from-[#4f2c0d] via-[#291305] to-slate-900',
    borderColor: 'border-amber-700/30',
    iconBg: 'bg-amber-950/50 border border-amber-700/45',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-900/30',
    icon: Compass,
    items: [
      {
        title: 'Sunan Gresik (Maulana Malik Ibrahim)',
        desc: 'Sesepuh Wali Songo yang merintis dakwah melalui jalur pertanian, kedokteran gratis, dan perniagaan santun.',
        query: 'Kisah riwayat dakwah Sunan Gresik (Maulana Malik Ibrahim) di Nusantara, asal-usul nasab keturunan beliau, metode dakwah kultural merangkul rakyat jelata, dan rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Ampel (Raden Rahmat)',
        desc: 'Perancang Kerajaan Demak dan pendiri Pesantren Ampeldenta yang masyhur dengan falsafah moral dakwah "Moh Limo".',
        query: 'Kisah riwayat dakwah Sunan Ampel (Raden Rahmat), silsilah keturunannya, pendirian pondok pesantren Ampeldenta, ajaran falsafah moral Moh Limo, dan rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Bonang (Raden Makhdum Ibrahim)',
        desc: 'Putra Sunan Ampel, ulama sastrawan agung pencipta tembang Suluk Wijil dan alat musik dakwah gamelan Bonang.',
        query: 'Kisah riwayat dakwah Sunan Bonang (Raden Makhdum Ibrahim), karya sastra Suluk Wijil dan tembang Tombo Ati, penyebaran Islam melalui kesenian gamelan, dan rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Drajat (Raden Syarifuddin)',
        desc: 'Ulama berjiwa sosial tinggi yang memusatkan dakwah pada penyantunan anak yatim, janda miskin, dan penderita sakit.',
        query: 'Kisah riwayat dakwah Sunan Drajat (Raden Syarifuddin), ajaran kedermawanan sosialnya yang legendaris (Tembang Pangkur), dan rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Kudus (Ja\'far Shadiq)',
        desc: 'Pakar hukum Islam (Fikih) dan toleransi budaya luhur yang melarang penyembelihan sapi demi menghormati umat Hindu.',
        query: 'Kisah riwayat dakwah Sunan Kudus (Ja\'far Shadiq), keahliannya dalam ilmu fikih dan tauhid, simbol toleransi menara Kudus, serta rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Giri (Raden Paku)',
        desc: 'Pendiri Kedaton Giri yang dakwahnya meluas hingga Maluku, dikenal pencipta permainan anak Islami Jelungan.',
        query: 'Kisah riwayat dakwah Sunan Giri (Raden Paku), berdirinya pemerintahan Giri Kedaton, pengaruh dakwahnya hingga luar Jawa, permainan anak Cublak-cublak Suweng, dan rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Kalijaga (Raden Said)',
        desc: 'Maestro sastrawan kultural yang menyisipkan nilai tauhid murni melalui wayang kulit dan Kidung Rumekso ing Wengi.',
        query: 'Kisah riwayat dakwah Sunan Kalijaga (Raden Said) di Nusantara, metode dakwah kultural asimilasi wayang kulit, silsilah keturunan, and rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Muria (Raden Umar Said)',
        desc: 'Putra Sunan Kalijaga yang berdakwah dengan bersahaja di lereng gunung tinggi, membimbing para petani dan pelaut.',
        query: 'Kisah riwayat dakwah Sunan Muria (Raden Umar Said), kesederhanaannya membimbing masyarakat pedalaman lereng gunung Muria, tembang Sinom, and rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      },
      {
        title: 'Sunan Gunung Jati (Syarif Hidayatullah)',
        desc: 'Satu-satunya Wali Songo pembangun kesultanan Islam di Cirebon dan Banten, mempertemukan dakwah dengan kepemimpinan.',
        query: 'Kisah riwayat dakwah Sunan Gunung Jati (Syarif Hidayatullah), perannya mendirikan Kesultanan Cirebon, silsilah keturunan tersambung ke Rasulullah, and rujukan sejarah Ahlussunnah wal Jama\'ah secara lengkap.'
      }
    ]
  }
];
