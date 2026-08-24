const fs = require('fs');

const questions = [
  // AlQuran
  {
    id: 'alquran-8', topic: 'alquran',
    question: 'Siapakah wanita satu-satunya yang namanya diabadikan sebagai nama surah dalam Al-Quran?',
    options: ['Khadijah', 'Aisyah', 'Maryam', 'Fatimah'],
    correctIndex: 2, explanation: 'Maryam binti Imran, ibunda Nabi Isa AS, adalah satu-satunya wanita yang namanya menjadi nama surah ke-19 dalam Al-Quran.'
  },
  {
    id: 'alquran-9', topic: 'alquran',
    question: 'Berapakah jumlah ayat dalam Surah Al-Fatihah?',
    options: ['5 Ayat', '6 Ayat', '7 Ayat', '8 Ayat'],
    correctIndex: 2, explanation: 'Surah Al-Fatihah terdiri atas 7 ayat, dan dikenal dengan nama As-Sab\'ul Matsani (Tujuh yang berulang-ulang).'
  },
  // Tafsir
  {
    id: 'tafsir-6', topic: 'Tafsir Al-Quran',
    question: 'Tafsir Al-Mishbah adalah salah satu kitab tafsir Nusantara yang dikarang oleh...',
    options: ['Buya Hamka', 'Quraish Shihab', 'Gus Baha', 'KH Maimun Zubair'],
    correctIndex: 1, explanation: 'Tafsir Al-Mishbah ditulis oleh cendekiawan muslim asal Indonesia, Prof. Dr. M. Quraish Shihab.'
  },
  {
    id: 'tafsir-7', topic: 'Tafsir Al-Quran',
    question: 'Kitab Tafsir Al-Azhar adalah mahakarya ulama besar Indonesia, yaitu...',
    options: ['KH Hasyim Asy\'ari', 'Buya Hamka', 'Kyai Nawawi Banten', 'KH Ahmad Dahlan'],
    correctIndex: 1, explanation: 'Tafsir Al-Azhar dikarang oleh Prof. Dr. Buya Hamka saat beliau di dalam penjara.'
  },
  // Hadits
  {
    id: 'hadits-10', topic: 'Hadits',
    question: 'Kitab yang memuat empat puluh hadits pilihan tentang pilar agama Islam dan sangat populer adalah...',
    options: ['Riyadhus Shalihin', 'Bulughul Maram', 'Arba\'in Nawawi', 'Fathul Bari'],
    correctIndex: 2, explanation: 'Hadits Arba\'in Nawawi disusun oleh Imam Yahya bin Syaraf An-Nawawi, memuat 42 hadits inti ajaran Islam.'
  },
  // Akidah
  {
    id: 'akidah-10', topic: 'Akidah (Tauhid)',
    question: 'Sifat Allah "Wahdaniyat" berarti...',
    options: ['Berbeda dengan makhluk', 'Berdiri sendiri', 'Maha Esa (Tunggal)', 'Maha Mendengar'],
    correctIndex: 2, explanation: 'Wahdaniyat artinya Allah Maha Esa (satu) dalam dzat, sifat, maupun perbuatan-Nya.'
  },
  // Fiqih
  {
    id: 'fiqih-12', topic: 'Fiqih',
    question: 'Di antara shalat sunnah berikut, manakah shalat yang disyariatkan dilaksanakan secara berjamaah?',
    options: ['Tahiyatul Masjid', 'Tarawih', 'Rawatib Qabliyah', 'Dhuha'],
    correctIndex: 1, explanation: 'Shalat Tarawih sangat dianjurkan untuk dikerjakan secara berjamaah di bulan Ramadhan.'
  },
  // Mantiq
  {
    id: 'mantiq-5', topic: 'Mantiq (Logika)',
    question: 'Dalam mantiq, proses mengambil kesimpulan dari hal yang bersifat umum menjadi khusus disebut...',
    options: ['Istiqra (Induksi)', 'Qiyas (Deduksi)', 'Burhan', 'Khatabah'],
    correctIndex: 1, explanation: 'Qiyas secara logika Aristotelian (Deduksi) adalah penarikan kesimpulan dari premis mayor (umum) ke minor (khusus).'
  },
  // Tasawuf
  {
    id: 'tasawuf-9', topic: 'Akhlaq & Tasawuf',
    question: 'Maqam (tingkatan) tertinggi dalam spiritual sufi di mana seorang hamba senantiasa mencintai Allah di atas segalanya disebut...',
    options: ['Mahabbah', 'Raja\'', 'Khauf', 'Tawakkal'],
    correctIndex: 0, explanation: 'Mahabbah adalah maqam puncak kecintaan yang mendalam kepada Allah, tokoh utamanya adalah Rabiah al-Adawiyah.'
  },
  // Tarikh
  {
    id: 'tarikh-8', topic: 'Tarikh (Sejarah)',
    question: 'Kholifah Bani Umayyah yang terkenal sangat adil hingga disetarakan sebagai Khulafaur Rasyidin ke-5 adalah...',
    options: ['Muawiyah bin Abu Sufyan', 'Yazid bin Muawiyah', 'Umar bin Abdul Aziz', 'Abdul Malik bin Marwan'],
    correctIndex: 2, explanation: 'Umar bin Abdul Aziz memimpin dengan sangat adil dan makmur hingga tidak ada rakyat yang layak menerima zakat.'
  },
  // Sholawat
  {
    id: 'sholawat-7', topic: 'Kumpulan Sholawat',
    question: 'Sholawat Fatih sering dinisbatkan sebagai hizib dan amalan utama dari thariqah...',
    options: ['Qadiriyah', 'Naqsyabandiyah', 'Tijaniyah', 'Syadziliyah'],
    correctIndex: 2, explanation: 'Sholawat Al-Fatih merupakan wirid sentral yang diamalkan dalam Thariqah At-Tijaniyah.'
  },
  // Maulid
  {
    id: 'maulid-5', topic: 'Kitab Maulid',
    question: 'Kitab Maulid yang dikarang oleh Al-Habib Ali bin Muhammad bin Husain Al-Habsyi adalah...',
    options: ['Maulid Diba\'', 'Maulid Barzanji', 'Maulid Simtuddurar', 'Maulid Azab'],
    correctIndex: 2, explanation: 'Simtuddurar karangan Habib Ali Al-Habsyi sangat masyhur dibaca di majelis-majelis Maulid di Indonesia.'
  },
  // Ratib
  {
    id: 'ratib-4', topic: 'Kitab Ratib',
    question: 'Susunan kalimat "La ilaha illallah" yang diulang berkali-kali dalam Ratib biasa disebut dzikir...',
    options: ['Nafi & Itsbat', 'Hauqalah', 'Basmalah', 'Istirja\''],
    correctIndex: 0, explanation: 'La Ilaha Illallah terdiri dari Nafi (meniadakan Tuhan selain Allah) dan Itsbat (menetapkan Allah).'
  },
  // Tajwid
  {
    id: 'tajwid-7', topic: 'Ilmu Tajwid',
    question: 'Jika nun mati (نْ) bertemu dengan huruf Ba (ب), maka suaranya berubah menjadi mim (م). Hukum ini disebut...',
    options: ['Izhar', 'Iqlab', 'Ikhfa', 'Idgham'],
    correctIndex: 1, explanation: 'Iqlab artinya menukar/mengganti suara nun mati menjadi mim yang ditahan dengan dengungan saat bertemu huruf ba.'
  },
  {
    id: 'fiqih-13', topic: 'Fiqih',
    question: 'Hukum berkumur-kumur (madhmadhoh) saat berwudhu adalah...',
    options: ['Fardhu / Wajib', 'Sunnah', 'Makruh', 'Mubah'],
    correctIndex: 1, explanation: 'Berkumur-kumur (berkemu) hukumnya sunnah, bukan termasuk 6 rukun wudhu yang wajib.'
  },
  {
    id: 'akidah-11', topic: 'Akidah (Tauhid)',
    question: 'Hari dimana seluruh manusia dikumpulkan di sebuah padang yang luas setelah dibangkitkan dari kubur disebut...',
    options: ['Yaumul Mizan', 'Yaumul Hisab', 'Yaumul Ba\'ats', 'Yaumul Mahsyar'],
    correctIndex: 3, explanation: 'Yaumul Mahsyar adalah hari perkumpulan seluruh makhluk di Padang Mahsyar untuk menunggu pengadilan.'
  },
  {
    id: 'hadits-11', topic: 'Hadits',
    question: 'Sahabat yang paling banyak meriwayatkan hadits Nabi Muhammad SAW adalah...',
    options: ['Abu Hurairah', 'Abdullah bin Umar', 'Anas bin Malik', 'Aisyah'],
    correctIndex: 0, explanation: 'Abdurrahman bin Sakhr atau Abu Hurairah meriwayatkan sebanyak 5.374 hadits.'
  },
  {
    id: 'alquran-10', topic: 'alquran',
    question: 'Al-Quran diturunkan secara berangsur-angsur selama kurang lebih...',
    options: ['22 Tahun 2 Bulan 22 Hari', '25 Tahun', '30 Tahun', '10 Tahun'],
    correctIndex: 0, explanation: 'Masa turunnya Al-Quran adalah sekitar 23 tahun (tepatnya 22 tahun, 2 bulan, dan 22 hari).'
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
