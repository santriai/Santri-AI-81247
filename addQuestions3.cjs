const fs = require('fs');

const questions = [
  // Al-Quran
  { id: 'alquran-11', topic: 'alquran', question: 'Surah apakah yang dijuluki sebagai "Jantung Al-Quran" (Qalbul Quran)?', options: ['Al-Fatihah', 'Al-Mulk', 'Yasin', 'Ar-Rahman'], correctIndex: 2, explanation: 'Dalam hadits (meski dhaif menurut sebagian ulama, masyhur di kalangan santri) disebutkan bahwa "segala sesuatu ada jantungnya, dan jantung Al-Quran adalah surah Yasin."' },
  { id: 'alquran-12', topic: 'alquran', question: 'Ayat yang menjelaskan tentang doa naik kendaraan (Subhanalladzi sakhara lana hadza...) terdapat pada surah...', options: ['Al-Mu\'minun', 'Az-Zukhruf', 'Yunus', 'Al-Isra'], correctIndex: 1, explanation: 'Doa naik kendaraan diambil dari Surah Az-Zukhruf ayat 13-14.' },
  { id: 'alquran-13', topic: 'alquran', question: 'Siapakah nama Raja zalim (Fir\'aun) yang ditenggelamkan di Laut Merah saat mengejar Nabi Musa menurut para mufassir?', options: ['Ramses I', 'Ramses II / Merneptah', 'Ahmose', 'Tutankhamun'], correctIndex: 1, explanation: 'Mayoritas ahli sejarah dan mufassir menyebut Firaun pada zaman Nabi Musa adalah Ramses II (atau putranya, Merneptah).' },
  // Tafsir
  { id: 'tafsir-8', topic: 'Tafsir Al-Quran', question: 'Tafsir Mafatihul Ghaib (Tafsir Al-Kabir) adalah mahakarya di bidang tafsir dan kalam yang ditulis oleh...', options: ['Fakhruddin Ar-Razi', 'Imam Al-Qurtubi', 'Ibnu Katsir', 'Imam Asy-Syaukani'], correctIndex: 0, explanation: 'Tafsir Mafatihul Ghaib dikarang oleh Imam Fakhruddin Ar-Razi, sangat kaya dengan ilmu kalam dan filsafat.' },
  { id: 'tafsir-9', topic: 'Tafsir Al-Quran', question: 'Ayat Kursi yang merupakan ayat paling agung di dalam Al-Quran terdapat pada surah dan ayat ke...', options: ['Al-Baqarah ayat 255', 'Al-Baqarah ayat 282', 'Ali Imran ayat 18', 'Al-Maidah ayat 3'], correctIndex: 0, explanation: 'Ayat Kursi adalah surah Al-Baqarah ayat 255.' },
  // Hadits
  { id: 'hadits-12', topic: 'Hadits', question: 'Sebutan bagi seorang perawi hadits yang pelupa atau buruk hafalannya (Su\'ul Hifzh) akan menyebabkan hadits yang diriwayatkannya menjadi...', options: ['Shahih', 'Dhaif (Lemah)', 'Hasan', 'Mutawatir'], correctIndex: 1, explanation: 'Buruknya hafalan perawi merupakan cacat (jarah) yang menyebabkan derajat hadits turun menjadi Dhaif.' },
  { id: 'hadits-13', topic: 'Hadits', question: 'Hadits pertama dalam kitab Arba\'in Nawawi membahas tentang...', options: ['Kebersihan', 'Niat', 'Sabar', 'Shalat'], correctIndex: 1, explanation: 'Hadits pertama berbunyi "Innamal A\'malu bin Niyat" (Sesungguhnya amal itu tergantung niatnya).' },
  // Akidah
  { id: 'akidah-12', topic: 'Akidah (Tauhid)', question: 'Kitab Aqidatul Awam ditulis dalam bentuk syair (Nadhom) yang berjumlah...', options: ['100 bait', '50 bait', '57 bait', '40 bait'], correctIndex: 2, explanation: 'Nadhom Aqidatul Awam karya Syekh Ahmad Al-Marzuqi berjumlah 57 bait.' },
  { id: 'akidah-13', topic: 'Akidah (Tauhid)', question: 'Meyakini bahwa Al-Quran adalah Kalamullah (Firman Allah) dan BUKAN makhluk (ciptaan) merupakan prinsip pokok dari aliran...', options: ['Muktazilah', 'Qadariyah', 'Ahlussunnah wal Jama\'ah', 'Jabariyah'], correctIndex: 2, explanation: 'Aswaja meyakini Al-Quran adalah kalamullah (Sifat Allah), sedangkan Muktazilah menganggap Al-Quran adalah makhluk.' },
  // Fiqih
  { id: 'fiqih-14', topic: 'Fiqih', question: 'Darah yang keluar dari rahim wanita setelah proses melahirkan disebut darah...', options: ['Haidh', 'Istihadhoh', 'Wiladah', 'Nifas'], correctIndex: 3, explanation: 'Darah nifas adalah darah yang keluar mengiringi persalinan/melahirkan.' },
  { id: 'fiqih-15', topic: 'Fiqih', question: 'Syarat wajib mengeluarkan zakat fitrah adalah menemui dua waktu, yaitu...', options: ['Awal Ramadhan dan Akhir Ramadhan', 'Akhir Ramadhan dan Awal Syawal (Terbenam matahari akhir Ramadhan)', 'Nisfu Sya\'ban dan Ramadhan', 'Pagi Idul Fitri saja'], correctIndex: 1, explanation: 'Syarat wajib zakat fitrah adalah menemui sebagian bulan Ramadhan (akhirnya) dan sebagian bulan Syawal (awalnya).' },
  { id: 'fiqih-16', topic: 'Fiqih', question: 'Talak yang diucapkan suami kepada istri dengan adanya penyerahan harta (tebusan) dari pihak istri disebut...', options: ['Ila\' ', 'Zhihar', 'Khulu\'', 'Lian'], correctIndex: 2, explanation: 'Khulu\' (Gugat cerai) adalah perceraian yang inisiatifnya dari istri dengan mengembalikan mahar atau harta tebusan (iwadh) kepada suami.' },
  // Ushul Fiqh
  { id: 'ushul-fiqh-7', topic: 'Ushul Fiqih', question: 'Dalil yang bersifat umum, namun dikhususkan untuk kasus tertentu disebut dengan istilah...', options: ['Aam dan Khas', 'Mutlaq dan Muqayyad', 'Nasikh dan Mansukh', 'Mujmal dan Mubayyan'], correctIndex: 0, explanation: 'Aam (Umum) adalah lafaz yang mencakup banyak satuan, sedangkan Khas (Khusus) membatasinya.' },
  { id: 'ushul-fiqh-8', topic: 'Ushul Fiqih', question: 'Hukum meng-qadha shalat bagi orang yang haidh menurut kesepakatan ulama adalah...', options: ['Wajib', 'Sunnah', 'Tidak Wajib / Haram diqadha', 'Makruh'], correctIndex: 2, explanation: 'Wanita haidh gugur kewajiban shalatnya dan tidak perlu (bahkan dilarang/haram) mengqadha shalat yang ditinggalkan saat haidh.' },
  // Nahwu
  { id: 'nahwu-8', topic: 'Nahwu & Shorof', question: 'Kitab Jurumiyah, yang merupakan kitab dasar ilmu Nahwu, dikarang oleh...', options: ['Imam Sibawaih', 'Ibnu Malik', 'Ibnu Ajurrum', 'Syekh Zaini Dahlan'], correctIndex: 2, explanation: 'Matan Al-Ajurrumiyyah dikarang oleh Abu Abdillah Muhammad bin Dawud Ash-Shanhaji yang dikenal dengan Ibnu Ajurrum.' },
  { id: 'nahwu-9', topic: 'Nahwu & Shorof', question: 'Tanda i\'rab nashab bagi isim mutsanna (ganda) adalah...', options: ['Fathah', 'Alif', 'Kasrah', 'Ya'], correctIndex: 3, explanation: 'Isim mutsanna di-nashab-kan dan di-khafadh-kan (jer) dengan huruf Ya\', contoh: Ro\'aitu Zaidaini (رأيتُ زيدَيْنِ).' },
  // Mantiq
  { id: 'mantiq-6', topic: 'Mantiq (Logika)', question: 'Pembahasan mantiq tentang lafaz-lafaz (Kata/Term) untuk memahami maknanya disebut...', options: ['Tasawwur (Konseptualisasi)', 'Tashdiq (Pembenaran / Judgement)', 'Qiyas', 'Muwajjahah'], correctIndex: 0, explanation: 'Tasawwur adalah proses akal memahami makna sesuatu (konsep) tanpa memberikan penilaian benar atau salah.' },
  // Tasawuf
  { id: 'tasawuf-10', topic: 'Akhlaq & Tasawuf', question: 'Penulis kitab Bidayatul Hidayah (Permulaan Jalan Hidayah) yang sering dikaji di pesantren adalah...', options: ['Imam Al-Ghazali', 'Ibnu Athaillah', 'Abu Thalib Al-Makki', 'Imam Al-Qusyairi'], correctIndex: 0, explanation: 'Bidayatul Hidayah adalah karya Imam Al-Ghazali yang berisi panduan ibadah dan akhlak.' },
  { id: 'tasawuf-11', topic: 'Akhlaq & Tasawuf', question: 'Sikap berserah diri sepenuhnya kepada Allah setelah berusaha / berikhtiar disebut...', options: ['Qana\'ah', 'Tawakkal', 'Tawadhu', 'Sabar'], correctIndex: 1, explanation: 'Tawakkal adalah menyandarkan hati kepada Allah SWT dalam segala urusan setelah berikhtiar.' },
  // Tarikh
  { id: 'tarikh-9', topic: 'Tarikh (Sejarah)', question: 'Sahabat Nabi yang membebaskan Mesir dan menjadi gubernur pertama di sana adalah...', options: ['Amr bin Ash', 'Khalid bin Walid', 'Sa\'ad bin Abi Waqqash', 'Abu Ubaidah bin Jarrah'], correctIndex: 0, explanation: 'Amr bin Ash memimpin pembebasan Mesir di era Khalifah Umar bin Khattab dan mendirikan kota Fustat.' },
  { id: 'tarikh-10', topic: 'Tarikh (Sejarah)', question: 'Walisongo yang menyebarkan Islam di wilayah Jawa Barat (Cirebon dan Banten) adalah...', options: ['Sunan Ampel', 'Sunan Kalijaga', 'Sunan Gunung Jati', 'Sunan Bonang'], correctIndex: 2, explanation: 'Sunan Gunung Jati (Syarif Hidayatullah) berdakwah dan menjadi penguasa di Kesultanan Cirebon dan Banten.' },
  // Sholawat
  { id: 'sholawat-8', topic: 'Kumpulan Sholawat', question: 'Sholawat yang disusun oleh Syekh Abdul Qadir Al-Jailani yang masyhur dengan sebutan "Sholawat...",', options: ['Nariyah', 'Munjiyat', 'Tafsijiyah', 'Basyairul Khairat'], correctIndex: 3, explanation: 'Basyairul Khairat adalah himpunan sholawat susunan Sultanul Auliya Syekh Abdul Qadir Al-Jailani.' },
  // Maulid
  { id: 'maulid-6', topic: 'Kitab Maulid', question: 'Kitab Maulid "Ad-Diya Ullami" (Cahaya yang Terang Benderang) dikarang oleh ulama masa kini bernama...', options: ['Habib Luthfi bin Yahya', 'Habib Umar bin Hafidz', 'Habib Ali Al-Jufri', 'Habib Zain bin Smith'], correctIndex: 1, explanation: 'Ad-Diya Ullami disusun oleh Al-Habib Umar bin Hafidz (Tarim, Yaman).' },
  // Ratib
  { id: 'ratib-5', topic: 'Kitab Ratib', question: 'Ratib Kubro dan Ratib Sughro adalah sebutan lain yang sering dinisbatkan kepada karya...', options: ['Imam Al-Ghazali', 'Habib Thoha bin Yahya', 'Habib Ali bin Hasan Al-Attas / Habib Umar bin Abdurrahman', 'Syekh Abu Bakar bin Salim'], correctIndex: 2, explanation: 'Kadang masyarakat menyebut Ratib Al-Attas dan Ratib Al-Haddad dalam skala sughro/kubro tergantung penyajiannya.' },
  // Tajwid
  { id: 'tajwid-8', topic: 'Ilmu Tajwid', question: 'Berhentinya suara sejenak tanpa bernapas (sekitar 2 harakat) dengan niat melanjutkan bacaan disebut...', options: ['Waqaf', 'Saktah', 'Qatha\'', 'Ibtida\''], correctIndex: 1, explanation: 'Saktah adalah berhenti sejenak tanpa mengambil napas. Di dalam Al-Quran riwayat Hafsh ada 4 tempat wajib saktah.' },
  { id: 'tajwid-9', topic: 'Ilmu Tajwid', question: 'Tanda waqaf ( م ) mim kecil dalam Al-Quran menunjukkan hukum...', options: ['Waqaf Jaiz', 'Waqaf Lazim (Wajib Berhenti)', 'Laa Waqfa Fiih (Larangan Berhenti)', 'Waqaf Mu\'anaqah'], correctIndex: 1, explanation: 'Waqaf Lazim ditandai dengan huruf mim kecil, artinya qari (pembaca) harus berhenti.' },
  // Fiqih
  { id: 'fiqih-17', topic: 'Fiqih', question: 'Puasa sunnah yang dilakukan pada tanggal 9 Dzulhijjah bagi orang yang tidak sedang wuquf di Arafah disebut...', options: ['Puasa Tarwiyah', 'Puasa Asyura', 'Puasa Arafah', 'Puasa Syawal'], correctIndex: 2, explanation: 'Puasa Arafah disunnahkan pada 9 Dzulhijjah bagi umat Islam yang tidak menunaikan haji.' },
  // Al-Quran
  { id: 'alquran-14', topic: 'alquran', question: 'Berapakah jumlah ayat Sajdah dalam Al-Quran yang disunnahkan untuk melakukan Sujud Tilawah?', options: ['10 Ayat', '14 atau 15 Ayat', '20 Ayat', '7 Ayat'], correctIndex: 1, explanation: 'Terdapat 14 (atau 15 menurut sebagian riwayat) ayat sajdah dalam Al-Quran.' },
  { id: 'alquran-15', topic: 'alquran', question: 'Satu-satunya surah dalam Al-Quran yang memiliki dua buah lafaz "Bismillahir-rahmanir-rahim" adalah...', options: ['Surah Al-Baqarah', 'Surah At-Taubah', 'Surah An-Naml', 'Surah Al-Isra'], correctIndex: 2, explanation: 'Surah An-Naml memiliki Bismillah di awal surah dan di ayat ke-30 (pada surat Nabi Sulaiman untuk Ratu Balqis).' },
  // Akidah
  { id: 'akidah-14', topic: 'Akidah (Tauhid)', question: 'Nabi yang mendapat gelar "Khalilullah" (Kekasih Allah) adalah...', options: ['Nabi Muhammad SAW', 'Nabi Musa AS', 'Nabi Ibrahim AS', 'Nabi Isa AS'], correctIndex: 2, explanation: 'Gelar Khalilullah (Kekasih Allah) diberikan kepada Nabi Ibrahim AS.' },
  // Nahwu
  { id: 'nahwu-10', topic: 'Nahwu & Shorof', question: 'Huruf Jar (huruf yang membuat isim menjadi majrur/kasrah) berjumlah sekitar 9 dalam Alfiyah. Manakah yang BUKAN huruf Jar?', options: ['Min (من)', 'Ila (إلى)', 'Fi (في)', 'Inna (إنّ)'], correctIndex: 3, explanation: 'Inna (إنّ) adalah huruf penashab mubtada (Inna wa Akhawatuha), bukan huruf Jar.' },
  // Tasawuf
  { id: 'tasawuf-12', topic: 'Akhlaq & Tasawuf', question: 'Istilah "Karamah" diberikan kepada kejadian luar biasa yang muncul pada diri seorang...', options: ['Nabi atau Rasul', 'Wali Allah yang shalih', 'Orang awam (Ma\'unah)', 'Orang fasik / penyihir (Istidraj)'], correctIndex: 1, explanation: 'Karamah adalah keistimewaan luar biasa yang diberikan Allah kepada para Kekasih-Nya (Wali Allah).' },
  // Hadits
  { id: 'hadits-14', topic: 'Hadits', question: 'Ulama hadits membagi perawi berdasarkan tingkat kejujuran dan kekuatan hafalannya (Adil & Dhabith). Proses penilaian cacat atau pujian pada perawi disebut...', options: ['Ilmu Musthalah', 'Ilmu Jarh wa Ta\'dil', 'Ilmu Takhrij', 'Ilmu Rijal'], correctIndex: 1, explanation: 'Al-Jarh wa at-Ta\'dil adalah ilmu untuk menimbang cacat (jarh) dan keadilan/pujian (ta\'dil) para perawi.' },
  // Tarikh
  { id: 'tarikh-11', topic: 'Tarikh (Sejarah)', question: 'Masjid pertama yang dibangun oleh Rasulullah SAW saat peristiwa Hijrah sebelum sampai di Madinah adalah...', options: ['Masjid Nabawi', 'Masjid Quba', 'Masjidil Haram', 'Masjid Qiblatain'], correctIndex: 1, explanation: 'Masjid Quba dibangun oleh Nabi Muhammad SAW dalam perjalanan hijrah sebelum memasuki pusat kota Madinah.' },
  // Tafsir
  { id: 'tafsir-10', topic: 'Tafsir Al-Quran', question: 'Mufassir dari kalangan sahabat yang bergelar "Turjumanul Quran" (Penerjemah Al-Quran) berkat doa Nabi SAW adalah...', options: ['Ali bin Abi Thalib', 'Ibnu Mas\'ud', 'Ibnu Abbas', 'Zaid bin Tsabit'], correctIndex: 2, explanation: 'Abdullah bin Abbas RA dijuluki Turjumanul Quran karena kepakarannya dalam tafsir berkat doa Nabi SAW.' },
  // Ushul Fiqh
  { id: 'ushul-fiqh-9', topic: 'Ushul Fiqih', question: 'Hukum syar\'i yang berupa pilihan (keringanan) dalam kondisi darurat atau kesukaran disebut...', options: ['Azimah', 'Rukhshah', 'Mubah', 'Fardhu Kifayah'], correctIndex: 1, explanation: 'Rukhshah adalah keringanan hukum karena adanya udzur (seperti bolehnya menjamak shalat bagi musafir).' },
  // Fiqih
  { id: 'fiqih-18', topic: 'Fiqih', question: 'Menyapu / mengusap sebagian kepala dalam wudhu menurut madzhab Syafi\'i hukumnya adalah...', options: ['Sunnah', 'Fardhu (Rukun)', 'Makruh', 'Mubah'], correctIndex: 1, explanation: 'Mengusap sebagian rambut/kulit kepala adalah salah satu dari 6 Rukun/Fardhu Wudhu dalam mazhab Syafi\'i.' },
  // Mantiq
  { id: 'mantiq-7', topic: 'Mantiq (Logika)', question: 'Pernyataan (Qodhiyah) "Semua manusia pasti mati" dalam Mantiq disebut...', options: ['Kulliyah Mujabah (Universal Afirmatif)', 'Juz\'iyyah Mujabah (Partikular Afirmatif)', 'Kulliyah Salibah (Universal Negatif)', 'Juz\'iyyah Salibah (Partikular Negatif)'], correctIndex: 0, explanation: 'Kulliyah (Semua/Setiap) Mujabah (Afirmatif/Positif) karena menyatakan ketetapan untuk seluruh individu.' },
  // Sholawat
  { id: 'sholawat-9', topic: 'Kumpulan Sholawat', question: 'Bait "Qamarun, Qamarun, Qamarun Sindan Nabi Qamarun..." sering didendangkan dalam kasidah pujian. Kata "Qamarun" artinya...', options: ['Matahari', 'Bintang', 'Bulan Purnama', 'Cahaya'], correctIndex: 2, explanation: 'Qamarun berarti bulan (purnama), menganalogikan wajah Rasulullah SAW yang lebih indah dari bulan.' },
  // Tajwid
  { id: 'tajwid-10', topic: 'Ilmu Tajwid', question: 'Membaca huruf Ra (ر) tipis (Tarqiq) diwajibkan apabila huruf Ra tersebut...', options: ['Berharakat Dhammah', 'Berharakat Fathah', 'Berharakat Kasrah', 'Bertemu huruf Isti\'la'], correctIndex: 2, explanation: 'Huruf Ra dibaca tipis (tarqiq) jika ia berharakat kasrah (Contoh: Rizaqon).' },
  // AlQuran
  { id: 'alquran-16', topic: 'alquran', question: 'Hewan yang bisa berbicara dan memberi kabar kepada Nabi Sulaiman tentang negeri Saba\' adalah...', options: ['Semut', 'Burung Hud-Hud', 'Kuda', 'Ular'], correctIndex: 1, explanation: 'Burung Hud-Hud yang mengabarkan adanya kerajaan Saba yang dipimpin oleh seorang ratu (Balqis).' },
  { id: 'alquran-17', topic: 'alquran', question: 'Surah Al-Kautsar adalah surah terpendek dalam Al-Quran. Berapakah jumlah ayatnya?', options: ['3 Ayat', '4 Ayat', '5 Ayat', '2 Ayat'], correctIndex: 0, explanation: 'Surah Al-Kautsar (Nikmat yang banyak) hanya terdiri dari 3 ayat.' },
  // Tarikh
  { id: 'tarikh-12', topic: 'Tarikh (Sejarah)', question: 'Kekuasaan dinasti Bani Abbasiyah di Baghdad runtuh pada tahun 1258 M akibat serangan bangsa...', options: ['Romawi', 'Persia', 'Mongol (Tartar)', 'Salib'], correctIndex: 2, explanation: 'Baghdad dihancurkan oleh pasukan Mongol yang dipimpin oleh Hulagu Khan (cucu Jengis Khan) pada 1258 M.' },
  // Fiqih
  { id: 'fiqih-19', topic: 'Fiqih', question: 'Rukun khutbah Jumat ada 5. Manakah di bawah ini yang BUKAN merupakan rukun khutbah Jumat?', options: ['Membaca Hamdalah', 'Membaca Sholawat Nabi', 'Berwasiat Taqwa', 'Membaca doa qunut'], correctIndex: 3, explanation: 'Qunut bukan rukun khutbah. Rukun khutbah: Hamdalah, Sholawat, Wasiat Taqwa, Doa untuk mukminin, & membaca minimal 1 ayat Al-Quran.' },
  // Akidah
  { id: 'akidah-15', topic: 'Akidah (Tauhid)', question: 'Percaya kepada takdir Allah, baik takdir yang baik maupun yang buruk (Qadha dan Qadar) adalah rukun Iman yang ke...', options: ['3', '4', '5', '6'], correctIndex: 3, explanation: 'Beriman kepada Qadha dan Qadar (Takdir) adalah rukun iman ke-6.' },
  // Tasawuf
  { id: 'tasawuf-13', topic: 'Akhlaq & Tasawuf', question: 'Penyakit hati berupa sifat memamerkan ibadah/kebaikan agar mendapat pujian orang lain disebut...', options: ['Riya\'', 'Takabbur', 'Ghibah', 'Namimah'], correctIndex: 0, explanation: 'Riya\' adalah beramal saleh namun mengharapkan pandangan/pujian manusia (syirik khafi / syirik kecil).' },
  // Hadits
  { id: 'hadits-15', topic: 'Hadits', question: 'Hadits "Tuntutlah ilmu walau sampai ke negeri Cina" (Uthlubul \'ilma walau bish-shiin) menurut para ulama ahli hadits status sanadnya adalah...', options: ['Shahih Mutawatir', 'Hasan', 'Dhaif (Lemah) bahkan ada yang menilai Maudhu\' (Palsu)', 'Shahih Lighairih'], correctIndex: 2, explanation: 'Mayoritas pakar hadits (seperti Ibn Hibban & Al-Uqaili) menilai hadits ini dhaif jiddan hingga maudhu\', meski maknanya benar untuk menyemangati belajar.' },
  // Tafsir
  { id: 'tafsir-11', topic: 'Tafsir Al-Quran', question: 'Metode menafsirkan Al-Quran dengan Al-Quran, atau dengan Hadits, atau dengan perkataan sahabat disebut tafsir bil...', options: ['Ra\'yi (Akal)', 'Ma\'tsur (Riwayat)', 'Isyari (Sufi)', 'Fiqhi'], correctIndex: 1, explanation: 'Tafsir bil Ma\'tsur adalah penafsiran berdasarkan nas/riwayat yang shahih (Quran, Hadits, Atsar Sahabat).' },
  // Nahwu
  { id: 'nahwu-11', topic: 'Nahwu & Shorof', question: 'Mubtada\' dan Khobar keduanya ber-I\'rab...', options: ['Nashab', 'Khafadh (Jer)', 'Rafa\' (Marfu\')', 'Jazm'], correctIndex: 2, explanation: 'Mubtada dan Khobar termasuk kelompok isim-isim yang Marfu\' (di-rafa\'-kan).' },
  // Mantiq
  { id: 'mantiq-8', topic: 'Mantiq (Logika)', question: 'Istilah "Dilalah Lathdhiyyah Wadh\'iyyah" dalam mantiq merujuk pada...', options: ['Tanda jalan di lalu lintas', 'Penunjukan kata/lafaz terhadap makna berdasarkan kesepakatan bahasa', 'Penunjukan secara alami (seperti rintihan orang sakit)', 'Penunjukan secara akal (asap tanda ada api)'], correctIndex: 1, explanation: 'Dilalah lafdziyyah wadh\'iyyah adalah makna sebuah kata yang terjadi murni karena kesepakatan bahasa (konvensi).' }
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
