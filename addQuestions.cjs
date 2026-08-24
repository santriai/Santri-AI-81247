const fs = require('fs');

const questions = [
  // Al-Quran
  {
    id: 'alquran-1', topic: 'alquran',
    question: 'Surah apakah yang tidak diawali dengan lafaz Bismillah?',
    options: ['Al-Fatihah', 'At-Taubah', 'Al-Ikhlas', 'Yasin'],
    correctIndex: 1, explanation: 'Surah At-Taubah tidak diawali dengan Bismillah karena kandungannya tentang pelepasan diri dari kaum musyrikin.'
  },
  {
    id: 'alquran-2', topic: 'alquran',
    question: 'Siapakah satu-satunya nama sahabat Nabi yang disebutkan secara eksplisit dalam Al-Quran (Surah Al-Ahzab)?',
    options: ['Abu Bakar As-Siddiq', 'Zaid bin Haritsah', 'Umar bin Khattab', 'Ali bin Abi Thalib'],
    correctIndex: 1, explanation: 'Zaid bin Haritsah disebutkan namanya dalam QS Al-Ahzab ayat 37.'
  },
  {
    id: 'alquran-3', topic: 'alquran',
    question: 'Surah terpanjang dalam Al-Quran adalah...',
    options: ['Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Maidah'],
    correctIndex: 0, explanation: 'Surah Al-Baqarah adalah surah terpanjang dengan 286 ayat.'
  },
  {
    id: 'alquran-4', topic: 'alquran',
    question: 'Berapa jumlah Nabi dan Rasul yang namanya disebutkan dalam Al-Quran?',
    options: ['25', '20', '30', '15'],
    correctIndex: 0, explanation: 'Terdapat 25 Nabi dan Rasul yang namanya disebutkan secara tegas dalam Al-Quran.'
  },
  // Tafsir
  {
    id: 'tafsir-4', topic: 'Tafsir Al-Quran',
    question: 'Tafsir Jalalain dikarang oleh dua orang ulama bernama Jalaluddin. Siapakah mereka?',
    options: ['Jalaluddin Rumi dan Jalaluddin As-Suyuthi', 'Jalaluddin Al-Mahalli dan Jalaluddin As-Suyuthi', 'Jalaluddin Al-Qasimi dan Jalaluddin Rumi', 'Jalaluddin At-Thabari dan Jalaluddin Al-Mahalli'],
    correctIndex: 1, explanation: 'Tafsir Jalalain dikarang oleh Imam Jalaluddin Al-Mahalli dan dilanjutkan oleh muridnya Imam Jalaluddin As-Suyuthi.'
  },
  {
    id: 'tafsir-5', topic: 'Tafsir Al-Quran',
    question: 'Ayat "Ihdinash shiraatal mustaqiim" (Tunjukilah kami jalan yang lurus) terdapat pada surah...',
    options: ['Al-Baqarah', 'Al-Ikhlas', 'Al-Fatihah', 'An-Nas'],
    correctIndex: 2, explanation: 'Ayat ini adalah ayat ke-6 dari surah Al-Fatihah.'
  },
  // Hadits
  {
    id: 'hadits-6', topic: 'Hadits',
    question: 'Kitab Shahih Bukhari memuat ribuan hadits. Nama asli Imam Bukhari adalah...',
    options: ['Muhammad bin Ismail', 'Ahmad bin Hanbal', 'Muslim bin Al-Hajjaj', 'Abu Isa Muhammad'],
    correctIndex: 0, explanation: 'Nama asli Imam Bukhari adalah Muhammad bin Ismail Al-Bukhari.'
  },
  {
    id: 'hadits-7', topic: 'Hadits',
    question: 'Apa sebutan untuk hadits yang diriwayatkan oleh orang banyak di setiap tingkatannya sehingga mustahil mereka sepakat untuk berbohong?',
    options: ['Hadits Ahad', 'Hadits Mutawatir', 'Hadits Masyhur', 'Hadits Hasan'],
    correctIndex: 1, explanation: 'Hadits Mutawatir adalah hadits yang diriwayatkan oleh perawi yang sangat banyak dan mustahil mereka berdusta.'
  },
  {
    id: 'hadits-8', topic: 'Hadits',
    question: 'Di antara Kutubus Sittah (Enam Kitab Hadits Induk), kitab yang disusun oleh Imam Abu Dawud adalah...',
    options: ['Shahih Abu Dawud', 'Sunan Abu Dawud', 'Musnad Abu Dawud', 'Muwatta Abu Dawud'],
    correctIndex: 1, explanation: 'Kitab hadits yang disusun oleh Imam Abu Dawud dikenal dengan Sunan Abu Dawud.'
  },
  // Akidah
  {
    id: 'akidah-6', topic: 'Akidah (Tauhid)',
    question: 'Sifat Mustahil bagi Allah "Fana" (Binasa), kebalikan dari sifat Wajib...',
    options: ['Baqa (Kekal)', 'Qidam (Terdahulu)', 'Wujud (Ada)', 'Hayat (Hidup)'],
    correctIndex: 0, explanation: 'Fana artinya binasa, mustahil bagi Allah. Sifat wajibnya adalah Baqa yang berarti Kekal.'
  },
  {
    id: 'akidah-7', topic: 'Akidah (Tauhid)',
    question: 'Meyakini bahwa Allah Maha Melihat segala sesuatu adalah pengakuan atas sifat...',
    options: ['Sama (Mendengar)', 'Bashar (Melihat)', 'Kalam (Berfirman)', 'Qudrat (Berkuasa)'],
    correctIndex: 1, explanation: 'Sifat Bashar artinya Allah Maha Melihat segala sesuatu.'
  },
  {
    id: 'akidah-8', topic: 'Akidah (Tauhid)',
    question: 'Malaikat yang bertugas membagi rezeki dan menurunkan hujan adalah...',
    options: ['Jibril', 'Mikail', 'Izrail', 'Israfil'],
    correctIndex: 1, explanation: 'Malaikat Mikail diberi tugas oleh Allah untuk membagi rezeki dan mengatur hujan.'
  },
  // Fiqih
  {
    id: 'fiqih-7', topic: 'Fiqih',
    question: 'Shalat sunnah yang dilakukan untuk meminta petunjuk atau pilihan yang terbaik disebut...',
    options: ['Shalat Dhuha', 'Shalat Tahajjud', 'Shalat Istikharah', 'Shalat Hajat'],
    correctIndex: 2, explanation: 'Shalat Istikharah adalah shalat sunnah dua rakaat untuk memohon petunjuk Allah dalam mengambil keputusan.'
  },
  {
    id: 'fiqih-8', topic: 'Fiqih',
    question: 'Batas aurat laki-laki menurut mayoritas ulama (Jumhur) adalah...',
    options: ['Dada hingga paha', 'Pusar hingga lutut', 'Bahu hingga mata kaki', 'Seluruh tubuh kecuali wajah dan telapak tangan'],
    correctIndex: 1, explanation: 'Batas aurat laki-laki dalam shalat maupun di luar shalat adalah antara pusar hingga lutut.'
  },
  {
    id: 'fiqih-9', topic: 'Fiqih',
    question: 'Dalam ilmu waris (Faraidh), porsi warisan bagi suami jika istri yang meninggal memiliki anak (keturunan) adalah...',
    options: ['1/2 (Setengah)', '1/4 (Seperempat)', '1/8 (Seperdelapan)', '1/6 (Seperenam)'],
    correctIndex: 1, explanation: 'Suami mendapat 1/4 bagian jika istri meninggalkan keturunan.'
  },
  // Ushul Fiqh
  {
    id: 'ushul-fiqh-4', topic: 'Ushul Fiqih',
    question: 'Sesuatu yang secara mutlak dituntut untuk ditinggalkan/dilarang secara tegas disebut...',
    options: ['Makruh', 'Haram', 'Mubah', 'Syubhat'],
    correctIndex: 1, explanation: 'Haram adalah larangan yang bersifat pasti (jazim), pelakunya berdosa jika melanggar.'
  },
  {
    id: 'ushul-fiqh-5', topic: 'Ushul Fiqih',
    question: 'Menetapkan hukum pada suatu kejadian yang belum ada nasnya dengan kejadian yang sudah ada nasnya karena ada kesamaan \'illat (sebab) disebut...',
    options: ['Ijma', 'Qiyas', 'Istihsan', 'Urf'],
    correctIndex: 1, explanation: 'Ini adalah definisi Qiyas (Analogi) dalam Ushul Fiqih.'
  },
  // Nahwu
  {
    id: 'nahwu-4', topic: 'Nahwu & Shorof',
    question: 'Kalimat (kata) dalam bahasa Arab dibagi menjadi 3 macam, yaitu...',
    options: ['Isim, Fi\'il, Huruf', 'Fa\'il, Maf\'ul, Khobar', 'Mubtada, Khobar, Jumlah', 'Fi\'il Madhi, Mudhori, Amar'],
    correctIndex: 0, explanation: 'Kalimat dalam bahasa Arab terbagi menjadi 3: Isim (Kata Benda), Fi\'il (Kata Kerja), dan Huruf.'
  },
  {
    id: 'nahwu-5', topic: 'Nahwu & Shorof',
    question: 'Isim mufrad jika di-rafa\'kan (I\'rab Rafa\') tanda aslinya adalah...',
    options: ['Fathah', 'Kasrah', 'Dhammah', 'Sukun'],
    correctIndex: 2, explanation: 'Tanda asal untuk I\'rab Rafa\' pada isim mufrad adalah Dhammah.'
  },
  {
    id: 'nahwu-6', topic: 'Nahwu & Shorof',
    question: 'Fi\'il (kata kerja) yang menunjukkan makna lampau disebut...',
    options: ['Fi\'il Mudhari', 'Fi\'il Amar', 'Fi\'il Madhi', 'Fi\'il Nahi'],
    correctIndex: 2, explanation: 'Fi\'il Madhi adalah kata kerja bentuk lampau.'
  },
  // Mantiq
  {
    id: 'mantiq-3', topic: 'Mantiq (Logika)',
    question: 'Kata "Insan" (Manusia) dalam ilmu mantiq diklasifikasikan sebagai kulliyat al-khams bagian...',
    options: ['Jins (Genus)', 'Nau\' (Spesies)', 'Fashl (Diferensia)', 'Khashshoh (Properti)'],
    correctIndex: 1, explanation: 'Dalam Mantiq, Insan (Manusia) adalah Nau\' (Spesies), sedangkan Hayawan (Hewan) adalah Jins.'
  },
  {
    id: 'mantiq-4', topic: 'Mantiq (Logika)',
    question: 'Suatu proposisi (Pernyataan) yang pasti benarnya secara akal dan tidak bisa dipungkiri disebut...',
    options: ['Qodhiyah', 'Tanaqudh', 'Badihi (Aksioma)', 'Nadzari'],
    correctIndex: 2, explanation: 'Badihi adalah kebenaran apriori / aksioma yang tidak membutuhkan pembuktian lagi (contoh: 1+1=2).'
  },
  // Tasawuf
  {
    id: 'tasawuf-5', topic: 'Akhlaq & Tasawuf',
    question: 'Sikap menahan diri dari kemewahan dunia demi mendekatkan diri kepada Allah disebut...',
    options: ['Riya', 'Zuhud', 'Ujub', 'Sum\'ah'],
    correctIndex: 1, explanation: 'Zuhud adalah melepaskan keterikatan hati dari duniawi.'
  },
  {
    id: 'tasawuf-6', topic: 'Akhlaq & Tasawuf',
    question: 'Kitab tasawuf fenomenal "Al-Hikam" dikarang oleh ulama sufi bernama...',
    options: ['Imam Al-Ghazali', 'Syekh Ibnu Athaillah As-Sakandari', 'Syekh Abdul Qadir Al-Jailani', 'Imam Al-Qusyairi'],
    correctIndex: 1, explanation: 'Kitab Al-Hikam adalah karya monumental dari Syekh Ibnu Athaillah As-Sakandari.'
  },
  {
    id: 'tasawuf-7', topic: 'Akhlaq & Tasawuf',
    question: 'Perasaan tidak pernah puas dengan amal sendiri dan selalu merasa diawasi Allah disebut...',
    options: ['Muraqabah', 'Tawadhu', 'Hasad', 'Kibr'],
    correctIndex: 0, explanation: 'Muraqabah adalah maqam merasa diawasi Allah di setiap keadaan.'
  },
  // Tarikh
  {
    id: 'tarikh-4', topic: 'Tarikh (Sejarah)',
    question: 'Perang pertama dalam sejarah Islam antara kaum Muslimin dan kaum Quraisy Mekah adalah...',
    options: ['Perang Uhud', 'Perang Khandaq', 'Perang Badar', 'Perang Mut\'ah'],
    correctIndex: 2, explanation: 'Perang Badar Al-Kubra terjadi pada 17 Ramadhan tahun ke-2 H dan merupakan perang besar pertama.'
  },
  {
    id: 'tarikh-5', topic: 'Tarikh (Sejarah)',
    question: 'Siapakah Khulafaur Rasyidin yang diberi gelar "Dzunnurain" (Pemilik Dua Cahaya)?',
    options: ['Abu Bakar Ash-Shiddiq', 'Umar bin Khattab', 'Utsman bin Affan', 'Ali bin Abi Thalib'],
    correctIndex: 2, explanation: 'Utsman bin Affan dijuluki Dzunnurain karena menikahi dua putri Nabi Muhammad SAW (Ruqayyah dan Ummu Kultsum).'
  },
  {
    id: 'tarikh-6', topic: 'Tarikh (Sejarah)',
    question: 'Salahuddin Al-Ayyubi adalah pahlawan besar Islam yang berhasil membebaskan...',
    options: ['Konstantinopel', 'Andalusia', 'Baitul Maqdis (Yerusalem)', 'Baghdad'],
    correctIndex: 2, explanation: 'Salahuddin Al-Ayyubi merebut kembali Baitul Maqdis dari pasukan Salib pada tahun 1187 M.'
  },
  // Sholawat
  {
    id: 'sholawat-4', topic: 'Kumpulan Sholawat',
    question: 'Sholawat yang berisi pujian pengobatan "Tibb al-Qulub" (Obat hati) sering dikenal dengan...',
    options: ['Sholawat Nariyah', 'Sholawat Badar', 'Sholawat Thibbil Qulub (Syifa)', 'Sholawat Munjiyat'],
    correctIndex: 2, explanation: 'Sholawat Thibbil Qulub atau Syifa adalah sholawat memohon kesembuhan dan ketenangan hati.'
  },
  {
    id: 'sholawat-5', topic: 'Kumpulan Sholawat',
    question: 'Sholawat Badar dikarang oleh ulama Nusantara bernama...',
    options: ['KH Ali Manshur', 'KH Hasyim Asy\'ari', 'Sunan Kalijaga', 'Syekh Nawawi Al-Bantani'],
    correctIndex: 0, explanation: 'Sholawat Badar digubah oleh KH Ali Manshur (Banyuwangi) di era 1960-an.'
  },
  // Maulid
  {
    id: 'maulid-3', topic: 'Kitab Maulid',
    question: 'Kitab Maulid Ad-Diba\'i yang sangat masyhur dikarang oleh...',
    options: ['Al-Imam Al-Bushiri', 'Al-Imam Abdurrahman Ad-Diba\'i', 'Al-Habib Ali Al-Habsyi', 'Syekh Ja\'far Al-Barzanji'],
    correctIndex: 1, explanation: 'Maulid Diba\' disusun oleh Imam Wajihuddin Abdurrahman Ad-Diba\'i (Yaman).'
  },
  {
    id: 'maulid-4', topic: 'Kitab Maulid',
    question: 'Di dalam pembacaan Maulid, momen saat berdiri menyambut kehadiran Rasulullah SAW disebut...',
    options: ['Qiyam / Mahalul Qiyam', 'Tawassul', 'Khataman', 'Fatihah'],
    correctIndex: 0, explanation: 'Mahalul Qiyam atau Qiyam adalah saat pembacaan "Ya Nabi Salam \'Alaika" dengan posisi berdiri.'
  },
  // Ratib
  {
    id: 'ratib-2', topic: 'Kitab Ratib',
    question: 'Ratib Al-Attas disusun oleh ulama besar Hadhramaut yang bernama...',
    options: ['Al-Habib Abdullah bin Alawi Al-Haddad', 'Al-Habib Umar bin Abdurrahman Al-Attas', 'Al-Habib Ahmad Mashhur Al-Haddad', 'Al-Habib Anis Al-Habsyi'],
    correctIndex: 1, explanation: 'Ratib Al-Attas disusun oleh Al-Habib Umar bin Abdurrahman Al-Attas.'
  },
  {
    id: 'ratib-3', topic: 'Kitab Ratib',
    question: 'Bacaan "Ya Lathifun bi khalqihi..." sering dibaca dalam rangkaian wirid dari thariqah / ratib karya...',
    options: ['Imam Al-Ghazali', 'Habaib di Hadhramaut (seperti Ratib Haddad/Attas)', 'Imam Nawawi (Wiridul Lathif)', 'Semua jawaban benar'],
    correctIndex: 3, explanation: 'Kalimat pujian "Ya Lathifan bi khalqih..." merupakan wirid yang lazim dibaca di berbagai himpunan dzikir salafus shalih termasuk Wirid Lathif.'
  },
  // Tajwid
  {
    id: 'tajwid-3', topic: 'Ilmu Tajwid',
    question: 'Huruf Qalqalah ada 5 (lima), terkumpul dalam lafaz...',
    options: ['Baju di Toko (Ba, Jim, Dal, Tha, Qaf)', 'Yanmu (Ya, Nun, Mim, Wau)', 'Fahatstsuhu (Fa, Ha, Tsa, Ha, Syin)', 'Salatun (Sin, Alif, Lam, Ta, Nun)'],
    correctIndex: 0, explanation: 'Huruf Qalqalah adalah Qaf (ق), Tha (ط), Ba (ب), Jim (ج), dan Dal (د), disingkat Baju di Toko / Quthbu Jadin.'
  },
  {
    id: 'tajwid-4', topic: 'Ilmu Tajwid',
    question: 'Apabila Mim sukun (مْ) bertemu dengan huruf Mim (م), hukum bacaannya disebut...',
    options: ['Ikhfa Syafawi', 'Izhar Syafawi', 'Idgham Mimi (Mutamatsilain)', 'Idgham Bighunnah'],
    correctIndex: 2, explanation: 'Mim mati bertemu Mim disebut Idgham Mimi atau Idgham Mutamatsilain, dibaca mendengung.'
  },
  {
    id: 'tajwid-5', topic: 'Ilmu Tajwid',
    question: 'Berapa panjang harakat bacaan Mad Wajib Muttasil?',
    options: ['2 Harakat', '2 atau 4 Harakat', '4 atau 5 Harakat', '1 Harakat'],
    correctIndex: 2, explanation: 'Mad Wajib Muttasil (Mad thabi\'i bertemu hamzah dalam 1 kata) dibaca panjang 4-5 harakat.'
  },
  // More Al-Quran
  {
    id: 'alquran-5', topic: 'alquran',
    question: 'Surah yang turun di kota Makkah sebelum Rasulullah hijrah disebut surah...',
    options: ['Madaniyah', 'Makkiyah', 'Syamsiyah', 'Qamariyah'],
    correctIndex: 1, explanation: 'Surah Makkiyah adalah surah yang turun sebelum peristiwa hijrah Nabi ke Madinah.'
  },
  {
    id: 'alquran-6', topic: 'alquran',
    question: 'Ayat terpanjang dalam Al-Quran (Ayat Mudayanah / Hutang Piutang) terdapat pada Surah...',
    options: ['Al-Baqarah ayat 255', 'Al-Baqarah ayat 282', 'An-Nisa ayat 11', 'Yasin ayat 82'],
    correctIndex: 1, explanation: 'Al-Baqarah ayat 282 adalah ayat terpanjang, yang membahas pencatatan hutang-piutang.'
  },
  // More Fiqih
  {
    id: 'fiqih-10', topic: 'Fiqih',
    question: 'Rukun shalat yang mewajibkan kita diam sejenak dan tenang setelah bergerak disebut...',
    options: ['Iktidal', 'Tasyahud', 'Tumakninah', 'Sujud Sahwi'],
    correctIndex: 2, explanation: 'Tumakninah (tenang sejenak sekadar membaca Subhanallah) adalah salah satu rukun shalat menurut madzhab Syafi\'i.'
  },
  // More Tarikh
  {
    id: 'tarikh-7', topic: 'Tarikh (Sejarah)',
    question: 'Peristiwa perpindahan arah kiblat dari Masjidil Aqsa (Baitul Maqdis) ke Ka\'bah terjadi pada bulan...',
    options: ['Ramadhan', 'Rajab', 'Sya\'ban', 'Syawal'],
    correctIndex: 2, explanation: 'Pemindahan arah kiblat terjadi pada pertengahan bulan Sya\'ban tahun ke-2 Hijriyah.'
  },
  // More Hadits
  {
    id: 'hadits-9', topic: 'Hadits',
    question: 'Perkataan, perbuatan, maupun ketetapan (taqrir) dari Nabi Muhammad SAW disebut...',
    options: ['Atsar', 'Hadits', 'Khabar', 'Qaul'],
    correctIndex: 1, explanation: 'Hadits secara terminologi adalah segala yang disandarkan kepada Nabi SAW, baik perkataan, perbuatan, maupun taqrir.'
  },
  // More Akidah
  {
    id: 'akidah-9', topic: 'Akidah (Tauhid)',
    question: 'Sifat Jaiz bagi Allah SWT hanya ada satu, yaitu...',
    options: ['Berkuasa atas segalanya', 'Mengetahui yang gaib', 'Melakukan atau meninggalkan sesuatu yang mungkin (Fi\'lu kulli mumkinin au tarkuhu)', 'Mengutus rasul'],
    correctIndex: 2, explanation: 'Sifat jaiz bagi Allah hanya satu, yaitu bebas berkehendak mencipta/melakukan atau tidak melakukan segala hal yang mungkin terjadi.'
  },
  // More Tasawuf
  {
    id: 'tasawuf-8', topic: 'Akhlaq & Tasawuf',
    question: 'Ulama sufi yang terkenal dengan julukan "Hujjatul Islam" adalah...',
    options: ['Abu Yazid Al-Busthami', 'Jalaluddin Rumi', 'Imam Al-Ghazali', 'Hasan Al-Bashri'],
    correctIndex: 2, explanation: 'Imam Abu Hamid Al-Ghazali, pengarang kitab Ihya\' Ulumiddin, digelari Hujjatul Islam.'
  },
  // More Sholawat
  {
    id: 'sholawat-6', topic: 'Kumpulan Sholawat',
    question: 'Sholawat Burdah, karya sastra pujian yang fenomenal untuk Nabi SAW dikarang oleh...',
    options: ['Imam Al-Bushiri', 'Syekh Nawawi Banten', 'Habib Ali Al-Habsyi', 'Syekh Abdul Qadir Jaelani'],
    correctIndex: 0, explanation: 'Qashidah Burdah dikarang oleh Imam Syarafuddin Abu Abdillah Muhammad bin Zaid Al-Bushiri (Mesir).'
  },
  // More Ushul Fiqh
  {
    id: 'ushul-fiqh-6', topic: 'Ushul Fiqih',
    question: 'Konsensus atau kesepakatan para ulama mujtahid pada suatu masa terhadap suatu hukum syara\' disebut...',
    options: ['Qiyas', 'Ijma\'', 'Istihsan', 'Maslahah Mursalah'],
    correctIndex: 1, explanation: 'Ijma\' adalah sumber hukum Islam ketiga setelah Al-Quran dan Hadits berupa kesepakatan bulat para ulama mujtahid.'
  },
  // More Nahwu
  {
    id: 'nahwu-7', topic: 'Nahwu & Shorof',
    question: 'Isim yang menunjuk kepada pelaku pekerjaan (subjek) disebut...',
    options: ['Maf\'ul Bih', 'Fa\'il', 'Na\'at', 'Hal'],
    correctIndex: 1, explanation: 'Fa\'il adalah isim marfu\' (Rafa\') yang jatuh setelah fi\'il dan berkedudukan sebagai pelaku perbuatan (subjek).'
  },
  // More Tajwid
  {
    id: 'tajwid-6', topic: 'Ilmu Tajwid',
    question: 'Hukum membaca lafadz Allah (Lafzul Jalalah) dengan menebalkan suara (O) disebut...',
    options: ['Tarqiq', 'Tafkhim', 'Ghunnah', 'Ikhfa'],
    correctIndex: 1, explanation: 'Tafkhim (tebal) digunakan jika huruf sebelum lafaz Allah berharakat fathah atau dhammah.'
  },
  // More Fiqih
  {
    id: 'fiqih-11', topic: 'Fiqih',
    question: 'Air yang suci namun tidak mensucikan (contoh: air teh, air kelapa) dalam fikih disebut air...',
    options: ['Air Mutlak', 'Air Mutanajis', 'Air Musta\'mal', 'Air Thahir Ghairu Muthohhir'],
    correctIndex: 3, explanation: 'Air Thahir Ghairu Muthohhir adalah air suci (boleh diminum) tapi tidak sah untuk wudhu/mandi wajib.'
  },
  // More AlQuran
  {
    id: 'alquran-7', topic: 'alquran',
    question: 'Ayat yang menjelaskan perintah ibadah puasa wajib di bulan Ramadhan adalah...',
    options: ['QS. Al-Baqarah: 183', 'QS. Ali Imran: 97', 'QS. Al-Baqarah: 255', 'QS. Al-Maidah: 3'],
    correctIndex: 0, explanation: 'Ayat "Yaa ayyuhalladziina aamanuu kutiba \'alaikumush shiyaam..." terdapat di QS. Al-Baqarah: 183.'
  }
];

const content = fs.readFileSync('constants/defaultQuizBank.ts', 'utf8');
const lastBracketIndex = content.lastIndexOf('];');

if (lastBracketIndex !== -1) {
  const newContent = content.substring(0, lastBracketIndex) 
    + ',\n  ' + questions.map(q => JSON.stringify(q, null, 2)).join(',\n  ') 
    + '\n];\n';
  fs.writeFileSync('constants/defaultQuizBank.ts', newContent);
  console.log('Added ' + questions.length + ' questions successfully!');
} else {
  console.log('Could not find the closing bracket array.');
}
