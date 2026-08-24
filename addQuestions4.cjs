const fs = require('fs');

const questions = [
  // Al-Quran (5)
  {
    id: 'alquran-18', topic: 'alquran',
    question: 'Surah Al-Fiil dalam Al-Quran menceritakan peristiwa penyerangan Ka\'bah oleh tentara bergajah yang dipimpin oleh...',
    options: ['Fir\'aun', 'Raja Namrud', 'Abrahah Al-Asyram', 'Jalut'],
    correctIndex: 2, explanation: 'Raja Abrahah Al-Asyram dari Yaman memimpin pasukan bergajah untuk menghancurkan Ka\'bah namun dihancurkan oleh burung Ababil.'
  },
  {
    id: 'alquran-19', topic: 'alquran',
    question: 'Surah apakah dalam Al-Quran yang setiap ayatnya diakhiri dengan huruf "Sin" (س)?',
    options: ['Surah An-Nas', 'Surah Al-Ikhlas', 'Surah Al-Falaq', 'Surah Al-Kafirun'],
    correctIndex: 0, explanation: 'Surah An-Nas terdiri dari 6 ayat yang semuanya diakhiri huruf sin (An-naas, Al-khannaas, dst).'
  },
  {
    id: 'alquran-20', topic: 'alquran',
    question: 'Siapakah pemuda beriman yang diselamatkan Allah di dalam gua selama 309 tahun menurut Surah Al-Kahfi?',
    options: ['Ashabul Kahfi', 'Hawariyyun', 'Ashabul Ukhdud', 'Ashabush Shabt'],
    correctIndex: 0, explanation: 'Ashabul Kahfi adalah 7 pemuda dan seekor anjing (Qithmir) yang tertidur di dalam gua selama 309 tahun hijriyah.'
  },
  {
    id: 'alquran-21', topic: 'alquran',
    question: 'Surah dalam Al-Quran yang dinamai dari nama salah satu jenis serangga penyengat pembuat madu adalah...',
    options: ['Surah Al-Naml', 'Surah Al-Nahl', 'Surah Al-Ankabut', 'Surah Al-Baqarah'],
    correctIndex: 1, explanation: 'Surah Al-Nahl artinya Lebah, serangga pembuat madu yang dipuji dalam Al-Quran.'
  },
  {
    id: 'alquran-22', topic: 'alquran',
    question: 'Dalam Surah Al-Isra ayat 1, perjalanan malam hari Nabi Muhammad SAW dari Masjidil Haram ke Masjidil Aqsa dinamakan...',
    options: ['Mikraj', 'Hijrah', 'Isra\'', 'Mubatsir'],
    correctIndex: 2, explanation: 'Isra\' adalah perjalanan malam hari Nabi SAW dari Makkah ke Palestina (Masjidil Aqsa).'
  },

  // Tafsir Al-Quran (4)
  {
    id: 'tafsir-12', topic: 'Tafsir Al-Quran',
    question: 'Penafsiran ayat "Yadullahi fauqa aidihim" (Tangan Allah di atas tangan mereka) menurut ajaran Asy\'ariyah (Tafwid / Ta\'wil) diartikan sebagai...',
    options: ['Tangan fisik bertangan lima', 'Kekuasaan, Pertolongan, atau Rahmat Allah', 'Bentuk tubuh Allah yang besar', 'Sifat yang tidak bermakna sama sekali'],
    correctIndex: 1, explanation: 'Ulama Aswaja men-ta\'wil atau men-tafwidh ayat mutasyabihat; kata "Yad" diartikan kekuasaan/pertolongan Allah, suci dari sifat fisik makhluk.'
  },
  {
    id: 'tafsir-13', topic: 'Tafsir Al-Quran',
    question: 'Kitab Tafsir Al-Qurtubi (Al-Jami\' li Ahkam al-Quran) sangat terkenal menfokuskan pembahasan pada aspek...',
    options: ['Bahasa dan Sastra semata', 'Hukum-hukum Fiqih dalam ayat Al-Quran', 'Sejarah bani Israil', 'Kisah-kisah gaib'],
    correctIndex: 1, explanation: 'Tafsir Al-Qurtubi merupakan salah satu kitab tafsir ahkam terbesar yang menggali hukum fiqih dari ayat Al-Quran.'
  },
  {
    id: 'tafsir-14', topic: 'Tafsir Al-Quran',
    question: 'Makna lafaz "Al-Furqan" yang menjadi salah satu nama Al-Quran adalah...',
    options: ['Penerang kegelapan', 'Pembeda antara yang hak dan yang bathil', 'Penawar obat penyakit', 'Peringatan bagi manusia'],
    correctIndex: 1, explanation: 'Al-Furqan berasal dari kata faraqa yang berarti pembeda antara kebenaran dan kebathilan.'
  },
  {
    id: 'tafsir-15', topic: 'Tafsir Al-Quran',
    question: 'Surah Al-Ikhlas setara dengan sepertiga Al-Quran karena mengandung pembahasan utama tentang...',
    options: ['Hukum fiqih muamalah', 'Tauhid dan keesaan Sifat Allah', 'Sejarah para nabi terdahulu', 'Tanda-tanda hari kiamat'],
    correctIndex: 1, explanation: 'Inti Al-Quran terbagi 3: Tauhid, Hukum, dan Sejarah. Surah Al-Ikhlas memuat murni pokok Tauhid.'
  },

  // Hadits (4)
  {
    id: 'hadits-16', topic: 'Hadits',
    question: 'Istilah "Matan" dalam struktur hadits merujuk pada...',
    options: ['Silsilah perawi yang menyampaikan hadits', 'Isi redaksi atau materi sabda Nabi SAW', 'Pengarang kitab hadits', 'Derajat ke-shahih-an hadits'],
    correctIndex: 1, explanation: 'Matan adalah lafaz/redaksi kalimat isi hadits itu sendiri, sedangkan Sanad adalah rantai perawinya.'
  },
  {
    id: 'hadits-17', topic: 'Hadits',
    question: 'Hadits yang bersambung sanadnya sampai kepada Sahabat Nabi (bukan sabda Nabi) disebut hadits...',
    options: ['Marfu\'', 'Mauquf', 'Maqthu\'', 'Mursal'],
    correctIndex: 1, explanation: 'Mauquf adalah perataan/perbuatan yang disandarkan kepada Sahabat Nabi.'
  },
  {
    id: 'hadits-18', topic: 'Hadits',
    question: 'Gelar "Amirul Mu\'minin fil Hadits" dialamatkan kepada ulama pakar hadits terkemuka, yaitu...',
    options: ['Imam Al-Bukhari', 'Imam Al-Ghazali', 'Imam Asy-Syafi\'i', 'Imam Abu Hanifah'],
    correctIndex: 0, explanation: 'Imam Al-Bukhari dijuluki Amirul Mu\'minin fil Hadits karena kepakarannya yang tiada tanding dalam ilmu hadits.'
  },
  {
    id: 'hadits-19', topic: 'Hadits',
    question: 'Kitab Al-Muwatta\' adalah karya kitab hadits dan fiqih monumental susunan...',
    options: ['Imam Malik bin Anas', 'Imam Ahmad bin Hanbal', 'Imam Asy-Syafi\'i', 'Imam Muslim'],
    correctIndex: 0, explanation: 'Al-Muwatta\' disusun oleh Pendiri Madzhab Maliki, yaitu Imam Malik bin Anas di Madinah.'
  },

  // Akidah (Tauhid) (4)
  {
    id: 'akidah-16', topic: 'Akidah (Tauhid)',
    question: 'Dua aliran utama penyusun fondasi akidah Ahlussunnah wal Jama\'ah (Aswaja) dipelopori oleh...',
    options: ['Imam Abu Hasan Al-Asy\'ari & Imam Abu Mansur Al-Maturidi', 'Imam Wasil bin Ata & Imam Amr bin Ubaid', 'Imam Ibn Taimiyah & Imam Ibn Al-Qayyim', 'Imam Jahm bin Safwan & Imam Dirar bin Amr'],
    correctIndex: 0, explanation: 'Aswaja secara akidah menganut paham Asy\'ariyah (Imam Al-Asy\'ari) dan Maturidiyah (Imam Al-Maturidi).'
  },
  {
    id: 'akidah-17', topic: 'Akidah (Tauhid)',
    question: 'Sifat Wajib bagi Rasul "Amanah" artinya dapat dipercaya, kebalikan dari sifat mustahil...',
    options: ['Kizib (Dusta)', 'Khianat (Mungkir janji/Khianat)', 'Kitman (Menyembunyikan)', 'Baladah (Bodoh)'],
    correctIndex: 1, explanation: 'Khianat adalah sifat mustahil bagi Rasul. Para Rasul wajib bersifat Amanah.'
  },
  {
    id: 'akidah-18', topic: 'Akidah (Tauhid)',
    question: 'Sifat "Mukhalafatu lil Hawaditsi" bermakna bahwa Allah SWT...',
    options: ['Berbeda dengan segala makhluk/ciptaan-Nya', 'Maha Terdahulu tanpa awal', 'Maha Kekal tanpa akhir', 'Berdiri sendiri tanpa butuh bantuan'],
    correctIndex: 0, explanation: 'Mukhalafatu lil Hawaditsi artinya Allah berbeda dari segala hal yang baru (makhluk).'
  },
  {
    id: 'akidah-19', topic: 'Akidah (Tauhid)',
    question: 'Berapakah jumlah malaikat yang wajib diketahui nama dan tugasnya secara rinci oleh setiap muslim?',
    options: ['25 Malaikat', '10 Malaikat', '99 Malaikat', '4 Malaikat'],
    correctIndex: 1, explanation: 'Terdapat 10 malaikat yang wajib diketahui namanya secara spesifik.'
  },

  // Fiqih (4)
  {
    id: 'fiqih-20', topic: 'Fiqih',
    question: 'Kitab Fiqih Syafi\'iyyah ringkas "Safinatun Najah" dikarang oleh ulama asal Yaman bernama...',
    options: ['Syekh Salim bin Sumair Al-Hadhrami', 'Syekh Nawawi Banten', 'Imam Ibn Hajar Al-Haitami', 'Syekh Zainuddin Al-Malibari'],
    correctIndex: 0, explanation: 'Safinatun Najah disusun oleh Syekh Salim bin Abdullah bin Sumair Al-Hadhrami.'
  },
  {
    id: 'fiqih-21', topic: 'Fiqih',
    question: 'Sujud yang dilakukan karena lupa atau ragu jumlah rakaat dalam shalat dinamakan...',
    options: ['Sujud Tilawah', 'Sujud Syukur', 'Sujud Sahwi', 'Sujud Sajdah'],
    correctIndex: 2, explanation: 'Sujud Sahwi dilakukan 2 kali sebelum salam untuk menambal kekurangan/kelupaan sunnah ab\'ad shalat.'
  },
  {
    id: 'fiqih-22', topic: 'Fiqih',
    question: 'Yang BUKAN merupakan sunnah Ab\'ad dalam shalat menurut Mazhab Syafi\'i adalah...',
    options: ['Tasyahud Awal', 'Duduk Tasyahud Awal', 'Membaca doa Qunut Subuh', 'Membaca surah pendek setelah Al-Fatihah'],
    correctIndex: 3, explanation: 'Membaca surah pendek adalah Sunnah Hai\'ah (jika lupa tidak perlu sujud sahwi). Qunut dan Tasyahud Awal adalah Sunnah Ab\'ad.'
  },
  {
    id: 'fiqih-23', topic: 'Fiqih',
    question: 'Nishab emas untuk kewajiban zakat mal adalah setara dengan...',
    options: ['85 Gram Emas Murni', '100 Gram Emas', '520 Gram Emas', '50 Gram Emas'],
    correctIndex: 0, explanation: 'Nishab emas adalah 20 dinar atau setara 85 gram emas murni yang sudah haul (1 tahun).'
  },

  // Ushul Fiqih (4)
  {
    id: 'ushul-fiqh-10', topic: 'Ushul Fiqih',
    question: 'Kitab ushul fiqih tingkat dasar berbentuk matan ringkas "Al-Waraqat" dikarang oleh...',
    options: ['Imam Al-Haramain Al-Juwaini', 'Imam Al-Ghazali', 'Imam Tajuddin As-Subki', 'Imam Al-Amidi'],
    correctIndex: 0, explanation: 'Matan Al-Waraqat disusun oleh Imam Al-Haramain Abu al-Ma\'ali Al-Juwaini (guru Imam Al-Ghazali).'
  },
  {
    id: 'ushul-fiqh-11', topic: 'Ushul Fiqih',
    question: 'Kaidah Fiqhiyyah dasar "Al-Yaqinu La Yuzalu Bisy-Syakk" bermakna...',
    options: ['Segala sesuatu tergantung tujuannya', 'Keyakinan tidak dapat dihilangkan oleh keraguan', 'Kesukaran mendatangkan kemudahan', 'Bahaya harus dihilangkan'],
    correctIndex: 1, explanation: 'Al-Yaqinu la yuzalu bisy-syakk adalah salah satu dari 5 kaidah fiqih induk (Al-Qawaid Al-Khamsah).'
  },
  {
    id: 'ushul-fiqh-12', topic: 'Ushul Fiqih',
    question: 'Keadaan darurat atau hajat yang membolehkan hal yang dilarang tercantum dalam kaidah fiqhiyyah...',
    options: ['Al-Adatu Muhakkamah', 'Adh-Dharurato Tubihul Mahzhurat', 'Al-Masyaqqatu Tajlibut Taisir', 'Al-Umuru Bi Maqasidiha'],
    correctIndex: 1, explanation: 'Adh-Dharuratu tubihul mahzhurat artinya kondisi darurat membolehkan hal-hal yang semula dilarang.'
  },
  {
    id: 'ushul-fiqh-13', topic: 'Ushul Fiqih',
    question: 'Ulama yang dianggap sebagai peletak batu pertama pengkodifikasian Ilmu Ushul Fiqih melalui kitabnya "Al-Risalah" adalah...',
    options: ['Imam Abu Hanifah', 'Imam Malik bin Anas', 'Imam Muhammad bin Idris Asy-Syafi\'i', 'Imam Ahmad bin Hanbal'],
    correctIndex: 2, explanation: 'Imam Asy-Syafi\'i adalah perumus pertama ilmu Ushul Fiqih lewat kitab Al-Risalah.'
  },

  // Nahwu & Shorof (4)
  {
    id: 'nahwu-12', topic: 'Nahwu & Shorof',
    question: 'Kitab Alfiyah Ibnu Malik berisi nadhom ilmu Nahwu dan Shorof sebanyak...',
    options: ['500 Bait', '1000 Bait', '100 Bait', '300 Bait'],
    correctIndex: 1, explanation: 'Alfiyah berasal dari kata Alfiun yang berarti seribu (memuat sekitar 1.002 bait syair).'
  },
  {
    id: 'nahwu-13', topic: 'Nahwu & Shorof',
    question: 'Kelompok huruf penashab fi\'il mudhari (An, Lan, Idzan, Kai) dinamakan...',
    options: ['Nawasih', 'Nawasib (An-Nawasib)', 'Jawazim', 'Huruf Jar'],
    correctIndex: 1, explanation: 'An-Nawasib adalah huruf-huruf yang me-nashab-kan fi\'il mudhari.'
  },
  {
    id: 'nahwu-14', topic: 'Nahwu & Shorof',
    question: 'Fi\'il Amar (Kata Kerja Perintah) hukum dasarnya adalah...',
    options: ['Mabni (Sukun)', 'Mu\'rab (Rafa\')', 'Mu\'rab (Nashab)', 'Mu\'rab (Khafadh)'],
    correctIndex: 0, explanation: 'Fi\'il Amar hukumnya mabni di atas sukun (atau dibuang huruf illat/nun-nya).'
  },
  {
    id: 'nahwu-15', topic: 'Nahwu & Shorof',
    question: 'Perubahan bentuk kata dari kata dasar (Masdar/Fi\'il) menjadi berbagai bentuk kata kerja/benda dipelajari dalam ilmu...',
    options: ['Nahwu', 'Shorof (Tasrif)', 'Mantiq', 'Badi\''],
    correctIndex: 1, explanation: 'Ilmu Shorof membahas perubahan bentuk kata (morfologi/tasrif) Arab.'
  },

  // Mantiq (Logika) (3)
  {
    id: 'mantiq-9', topic: 'Mantiq (Logika)',
    question: 'Pengarang nazham ilmu Mantiq "Sullam al-Munawraq" yang sangat populer di pesantren adalah...',
    options: ['Syekh Abdurrahman Al-Akhdhari', 'Imam Al-Ghazali', 'Syekh Al-Damanhuri', 'Imam Al-Baji'],
    correctIndex: 0, explanation: 'Sullam al-Munawraq dikarang oleh Syekh Abdurrahman Al-Akhdhari (ulama Aljazair).'
  },
  {
    id: 'mantiq-10', topic: 'Mantiq (Logika)',
    question: 'Kebalikan dari Tasawwur dalam logika mantiq adalah Tashdiq, yang bermakna...',
    options: ['Memahami kata saja tanpa hukum', 'Pengakuan atau penghukuman benar/salah pada suatu hubungan pernyataan', 'Keraguan dalam berpikir', 'Kesesatan logika'],
    correctIndex: 1, explanation: 'Tashdiq adalah pembenaran/penilaian hukum pada suatu proposisi (misal: "Bumi itu bulat").'
  },
  {
    id: 'mantiq-11', topic: 'Mantiq (Logika)',
    question: 'Definisi (Had / Ta\'rif) yang menggunakan Jins Qarib dan Fashl Qarib dinamakan...',
    options: ['Had Tam (Definisi Sempurna)', 'Had Naqish', 'Rasm Tam', 'Rasm Naqish'],
    correctIndex: 0, explanation: 'Had Tam adalah ta\'rif paling sempurna dalam mantiq (contoh manusia = Hayawan Nathiq).'
  },

  // Akhlaq & Tasawuf (4)
  {
    id: 'tasawuf-14', topic: 'Akhlaq & Tasawuf',
    question: 'Tiga tingkatan pembersihan diri dalam tasawuf secara berurutan adalah...',
    options: ['Takhalli, Tahalli, Tajalli', 'Tajalli, Takhalli, Tahalli', 'Tahalli, Takhalli, Tajalli', 'Syariat, Hakikat, Tarekat'],
    correctIndex: 0, explanation: 'Takhalli (mengosongkan diri dari dosa), Tahalli (mengisi diri dengan akhlak terpuji), Tajalli (tersingkapnya cahaya ilahi).'
  },
  {
    id: 'tasawuf-15', topic: 'Akhlaq & Tasawuf',
    question: 'Perasaan dengki dan tidak senang melihat orang lain mendapatkan nikmat serta berharap nikmat itu hilang dinamakan...',
    options: ['Ujub', 'Hasad (Dengki)', 'Riya\'', 'Takabbur'],
    correctIndex: 1, explanation: 'Hasad adalah sifat tercela memusuhi dan memohon hilangnya nikmat orang lain.'
  },
  {
    id: 'tasawuf-16', topic: 'Akhlaq & Tasawuf',
    question: 'Pendiri Tarekat Qadiriyah yang bergelar "Sultanul Auliya" (Raja para Wali) adalah...',
    options: ['Syekh Ahmad Ar-Rifa\'i', 'Syekh Abdul Qadir Al-Jailani', 'Syekh Abul Hasan Asy-Syadzili', 'Syekh Bahauddin Naqsyaband'],
    correctIndex: 1, explanation: 'Syekh Abdul Qadir Al-Jailani (Baghdad) adalah pimpinan utama para wali Allah.'
  },
  {
    id: 'tasawuf-17', topic: 'Akhlaq & Tasawuf',
    question: 'Merasa kagum dan bangga dengan amal ibadah diri sendiri dinamakan...',
    options: ['Ujub', 'Riya\'', 'Sum\'ah', 'Namimah'],
    correctIndex: 0, explanation: 'Ujub adalah mengagumi kebaikan/kehebatan diri sendiri dan lupa bahwa itu adalah karunia Allah.'
  },

  // Tarikh (Sejarah) (4)
  {
    id: 'tarikh-13', topic: 'Tarikh (Sejarah)',
    question: 'Putri Rasulullah SAW yang menikah dengan Ali bin Abi Thalib dan melahirkan Hasan dan Husain adalah...',
    options: ['Siti Ruqayyah', 'Siti Ummu Kultsum', 'Siti Fatimah Az-Zahra', 'Siti Zainab'],
    correctIndex: 2, explanation: 'Siti Fatimah Az-Zahra RA adalah putri tercinta Rasulullah SAW.'
  },
  {
    id: 'tarikh-14', topic: 'Tarikh (Sejarah)',
    question: 'Pahlawan pemuda Islam yang menaklukkan kota Konstantinopel pada tahun 1453 M adalah...',
    options: ['Sultan Muhammad Al-Fatih', 'Sultan Saladin', 'Sultan Bayazid', 'Sultan Suleiman'],
    correctIndex: 0, explanation: 'Sultan Muhammad Al-Fatih (Sultan Mehmed II) memimpin Daulah Utsmaniyah membebaskan Konstantinopel di usia 21 tahun.'
  },
  {
    id: 'tarikh-15', topic: 'Tarikh (Sejarah)',
    question: 'Perjanjian damai antara kaum Muslimin dan kafir Quraisy pada tahun ke-6 Hijriyah dikenal dengan nama...',
    options: ['Piagam Madinah', 'Perjanjian Hudaibiyah', 'Fathu Makkah', 'Bai\'atur Ridwan'],
    correctIndex: 1, explanation: 'Perjanjian Hudaibiyah disepakati di Hudaibiyah tahun 6 H sebagai genjatan senjata selama 10 tahun.'
  },
  {
    id: 'tarikh-16', topic: 'Tarikh (Sejarah)',
    question: 'Tiga kota suci utama dalam agama Islam secara berurutan adalah...',
    options: ['Makkah, Madinah, Baitul Maqdis (Yerusalem)', 'Makkah, Kairo, Baghdad', 'Madinah, Makkah, Yaman', 'Makkah, Jeddah, Madinah'],
    correctIndex: 0, explanation: 'Makkah Al-Mukarramah, Madinah Al-Munawwarah, dan Masjidil Aqsa di Baitul Maqdis.'
  },

  // Kumpulan Sholawat (3)
  {
    id: 'sholawat-10', topic: 'Kumpulan Sholawat',
    question: 'Sholawat Nariyah (Sholawat Tafrijiyah) disusun oleh ulama bernama...',
    options: ['Syekh Ahmad An-Nari', 'Syekh Ibrahim Al-Tazi / Syekh Ahmad At-Tazi', 'Imam Al-Bushiri', 'KH Hasyim Asy\'ari'],
    correctIndex: 1, explanation: 'Sholawat Nariyah/Tafrijiyah disusun oleh Syekh Ahmad At-Tazi Al-Maghribi.'
  },
  {
    id: 'sholawat-11', topic: 'Kumpulan Sholawat',
    question: 'Hari yang paling utama dan sangat dianjurkan untuk memperbanyak bacaan sholawat kepada Nabi SAW adalah hari...',
    options: ['Senin', 'Kamis', 'Jumat', 'Ahad'],
    correctIndex: 2, explanation: 'Rasulullah SAW bersabda: Perbanyaklah sholawat kepadaku pada hari Jumat dan malam Jumat.'
  },
  {
    id: 'sholawat-12', topic: 'Kumpulan Sholawat',
    question: 'Sholawat "Asyghil" memiliki keutamaan khusus yaitu memohon perlindungan dari...',
    options: ['Penyakit menular', 'Kezaliman orang-orang zalim', 'Kemiskinan', 'Sihir'],
    correctIndex: 1, explanation: 'Sholawat Asyghil memohon agar Allah menyibukkan orang zalim dengan sesama orang zalim dan menyelamatkan orang beriman.'
  },

  // Kitab Maulid (2)
  {
    id: 'maulid-7', topic: 'Kitab Maulid',
    question: 'Kitab Maulid Barzanji disusun oleh Syekh Ja\'far bin Hasan Al-Barzanji yang merupakan mufti madzhab Syafi\'i di kota...',
    options: ['Makkah', 'Madinah', 'Kairo', 'Damaskus'],
    correctIndex: 1, explanation: 'Syekh Ja\'far Al-Barzanji lahir dan menjadi mufti di kota suci Madinah Munawwarah.'
  },
  {
    id: 'maulid-8', topic: 'Kitab Maulid',
    question: 'Pembacaan kisah kelahiran dan sirah Nabi Muhammad SAW hukumnya menurut kesepakatan ulama Ahlussunnah adalah...',
    options: ['Sunnah / Boleh dan bernilai pahala besar', 'Haram', 'Bid\'ah dhalalah', 'Makruh'],
    correctIndex: 0, explanation: 'Peringatan dan pembacaan maulid Nabi adalah bid\'ah hasanah / sunnah yang dianjurkan dalam Aswaja.'
  },

  // Kitab Ratib (2)
  {
    id: 'ratib-6', topic: 'Kitab Ratib',
    question: 'Nama "Al-Haddad" pada penyusun Ratib Al-Haddad merujuk pada gelar keluarga yang artinya...',
    options: ['Pandai Besi', 'Pedagang Emas', 'Penjual Minyak Wangi', 'Penggembala'],
    correctIndex: 0, explanation: 'Al-Haddad berarti pandai besi, gelar nenek moyang Habib Abdullah bin Alawi Al-Haddad.'
  },
  {
    id: 'ratib-7', topic: 'Kitab Ratib',
    question: 'Dzikir "Hasbunallah wa ni\'mal wakil" dalam ratib diambil dari petikan Surah...',
    options: ['Ali Imran ayat 173', 'Al-Baqarah ayat 286', 'Yasin ayat 58', 'Al-Anfal ayat 40'],
    correctIndex: 0, explanation: 'Lafaz Hasbunallah wa ni\'mal wakil terdapat di Surah Ali Imran ayat 173.'
  },

  // Ilmu Tajwid (3)
  {
    id: 'tajwid-11', topic: 'Ilmu Tajwid',
    question: 'Hukum membaca Nun Sukun / Tanwin yang bertemu dengan huruf Lam (ل) dan Ra (ر) dinamakan...',
    options: ['Idgham Bighunnah', 'Idgham Bilaghunnah', 'Izhar Halqi', 'Iqlab'],
    correctIndex: 1, explanation: 'Idgham Bilaghunnah dimasukkan tanpa dengung, hurufnya ada 2 yaitu Lam dan Ra.'
  },
  {
    id: 'tajwid-12', topic: 'Ilmu Tajwid',
    question: 'Apabila Mad Thabi\'i bertemu dengan Hamzah di dalam DUA KATA yang terpisah, hukumnya adalah...',
    options: ['Mad Wajib Muttasil', 'Mad Jaiz Munfasil', 'Mad Arid Lissukun', 'Mad Badal'],
    correctIndex: 1, explanation: 'Mad Jaiz Munfasil terjadi jika mad bertemu hamzah dalam dua kalimat terpisah (boleh dibaca 2, 4, atau 5 harakat).'
  },
  {
    id: 'tajwid-13', topic: 'Ilmu Tajwid',
    question: 'Membaca huruf dengan membalikkan atau mencondongkan harakat fathah ke arah kasrah (contoh kata "Majreha") disebut...',
    options: ['Isyram', 'Imalah', 'Tashil', 'Naqal'],
    correctIndex: 1, explanation: 'Imalah (Imalah Kubra) terdapat pada QS. Hud ayat 41 bacaan "Bismillahi majrehaa wa mursaahaa".'
  }
];

const content = fs.readFileSync('constants/defaultQuizBank.ts', 'utf8');
const lastBracketIndex = content.lastIndexOf('];');

if (lastBracketIndex !== -1) {
  const newContent = content.substring(0, lastBracketIndex) 
    + ',\n  ' + questions.map(q => JSON.stringify(q, null, 2)).join(',\n  ') 
    + '\n];\n';
  fs.writeFileSync('constants/defaultQuizBank.ts', newContent);
  console.log('Added ' + questions.length + ' MORE questions successfully!');
} else {
  console.log('Could not find the closing bracket array.');
}
