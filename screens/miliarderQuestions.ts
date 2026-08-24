export interface Question {
  id: number;
  level: number;
  question: string;
  options: string[];
  correct: number;
  category: string;
}

export const MILIARDER_QUESTIONS: Record<number, Question[]> = {
  1: [
    {
      id: 101,
      level: 1,
      question: "Ada berapa jumlah Rukun Islam yang wajib dijalankan umat Muslim?",
      options: ["3 Rukun", "4 Rukun", "5 Rukun", "6 Rukun"],
      correct: 2,
      category: "Dasar Islam"
    },
    {
      id: 102,
      level: 1,
      question: "Siapakah nama Nabi pertama yang diciptakan oleh Allah SWT?",
      options: ["Nabi Nuh AS", "Nabi Adam AS", "Nabi Ibrahim AS", "Nabi Muhammad SAW"],
      correct: 1,
      category: "Kisah Nabi"
    }
  ],
  2: [
    {
      id: 201,
      level: 2,
      question: "Malaikat Jibril dalam ajaran Islam memiliki tugas utama untuk...",
      options: ["Membagi rezeki", "Menyampaikan wahyu", "Mencabut nyawa", "Meniup sangkakala"],
      correct: 1,
      category: "Malaikat"
    },
    {
      id: 202,
      level: 2,
      question: "Kitab suci Al-Quran diturunkan secara mulia kepada nabi akhir zaman yaitu...",
      options: ["Nabi Musa AS", "Nabi Isa AS", "Nabi Muhammad SAW", "Nabi Ibrahim AS"],
      correct: 2,
      category: "Kitab Suci"
    }
  ],
  3: [
    {
      id: 301,
      level: 3,
      question: "Ada berapa rakaatkah jumlah sholat wajib dalam sehari semalam bagi seorang Muslim?",
      options: ["15 Rakaat", "17 Rakaat", "20 Rakaat", "12 Rakaat"],
      correct: 1,
      category: "Fiqih Sholat"
    },
    {
      id: 302,
      level: 3,
      question: "Nabi Muhammad SAW dilahirkan pada tahun bersejarah yang disebut...",
      options: ["Tahun Gajah", "Tahun Unta", "Tahun Hijrah", "Tahun Kabisat"],
      correct: 0,
      category: "Sirah Nabawiyah"
    }
  ],
  4: [
    {
      id: 401,
      level: 4,
      question: "Berapakah jumlah ayat yang menyusun keindahan Surat Al-Fatihah?",
      options: ["5 Ayat", "6 Ayat", "7 Ayat", "8 Ayat"],
      correct: 2,
      category: "Al-Quran"
    },
    {
      id: 402,
      level: 4,
      question: "Siapakah nama istri pertama Nabi Muhammad SAW yang sangat mulia?",
      options: ["Aisyah RA", "Khadijah RA", "Hafsah RA", "Zainab RA"],
      correct: 1,
      category: "Ummul Mukminin"
    }
  ],
  5: [
    {
      id: 501,
      level: 5,
      question: "Berapa jumlah Malaikat Allah yang wajib diimani oleh setiap Muslim?",
      options: ["5 Malaikat", "10 Malaikat", "25 Malaikat", "99 Malaikat"],
      correct: 1,
      category: "Rukun Iman"
    },
    {
      id: 502,
      level: 5,
      question: "Puasa wajib sebulan penuh bagi umat Islam dilaksanakan pada bulan...",
      options: ["Bulan Syawal", "Bulan Arafah", "Bulan Ramadhan", "Bulan Muharram"],
      correct: 2,
      category: "Puasa"
    }
  ],
  6: [
    {
      id: 601,
      level: 6,
      question: "Zakat fitrah wajib dikeluarkan oleh umat Muslim sebelum pelaksanaan...",
      options: ["Sholat Idul Adha", "Sholat Idul Fitri", "Sholat Tarawih", "Sembelih Qurban"],
      correct: 1,
      category: "Zakat"
    },
    {
      id: 602,
      level: 6,
      question: "Di kota manakah Rasulullah SAW wafat dan dimakamkan?",
      options: ["Kota Makkah", "Kota Madinah", "Kota Thaif", "Negara Yordania"],
      correct: 1,
      category: "Sirah Nabawiyah"
    }
  ],
  7: [
    {
      id: 701,
      level: 7,
      question: "Siapakah nama Khalifah pertama setelah wafatnya Rasulullah SAW?",
      options: ["Umar bin Khattab", "Abu Bakar Ash-Shiddiq", "Utsman bin Affan", "Ali bin Abi Thalib"],
      correct: 1,
      category: "Khulafaur Rasyidin"
    },
    {
      id: 702,
      level: 7,
      question: "Arah kiblat umat Islam ketika melaksanakan ibadah sholat menghadap ke...",
      options: ["Masjidil Aqsa", "Masjid Nabawi", "Ka'bah di Masjidil Haram", "Baitul Maqdis"],
      correct: 2,
      category: "Fiqih Sholat"
    }
  ],
  8: [
    {
      id: 801,
      level: 8,
      question: "Apakah nama perang besar pertama yang berhasil dimenangkan oleh umat Islam?",
      options: ["Perang Uhud", "Perang Badar", "Perang Khandaq", "Perang Tabuk"],
      correct: 1,
      category: "Sejarah Islam"
    },
    {
      id: 802,
      level: 8,
      question: "Siapakah nama sahabat nabi yang mendapat julukan mulia 'Al-Faruq'?",
      options: ["Abu Bakar Ash-Shiddiq", "Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"],
      correct: 1,
      category: "Sahabat Nabi"
    }
  ],
  9: [
    {
      id: 901,
      level: 9,
      question: "Perjalanan malam Nabi dari Masjidil Haram ke Masjidil Aqsa dinamakan...",
      options: ["Mikraj", "Isra'", "Hijrah", "Fathul Makkah"],
      correct: 1,
      category: "Peristiwa Penting"
    },
    {
      id: 902,
      level: 9,
      question: "Berapakah jumlah Nabi dan Rasul yang wajib diyakini oleh umat Islam?",
      options: ["10 Nabi", "25 Nabi", "99 Nabi", "313 Nabi"],
      correct: 1,
      category: "Rukun Iman"
    }
  ],
  10: [
    {
      id: 1001,
      level: 10,
      question: "Bagi Allah SWT, sifat wajib 'Wujud' secara bahasa memiliki arti...",
      options: ["Esa / Satu", "Ada", "Terdahulu", "Kekal"],
      correct: 1,
      category: "Sifat 20"
    },
    {
      id: 1002,
      level: 10,
      question: "Dalam akidah Ahlussunnah wal Jama'ah (Aswaja), Allah itu ada tanpa...",
      options: ["Kekuasaan", "Kehendak", "Tempat dan Arah", "Malaikat"],
      correct: 2,
      category: "Aqidah Aswaja"
    }
  ],
  11: [
    {
      id: 1101,
      level: 11,
      question: "Apabila ada nun suci (mati) atau tanwin bertemu dengan huruf 'Ba', maka hukum bacaan tajwidnya adalah...",
      options: ["Izhar Halqi", "Idgham Bighunnah", "Iqlab", "Ikhfa Haqiqi"],
      correct: 2,
      category: "Ilmu Tajwid"
    }
  ],
  12: [
    {
      id: 1201,
      level: 12,
      question: "Pertemuan mim suci (mati) dengan sesama huruf Mim disebut hukum bacaan...",
      options: ["Ikhfa Syafawi", "Idgham Mimi (Mutamatsilain)", "Izhar Syafawi", "Idgham Bilaghunnah"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  13: [
    {
      id: 1301,
      level: 13,
      question: "Sifat wajib bagi Allah SWT 'Qidam' secara istilah berarti...",
      options: ["Berbeda dari makhluk", "Dahulu tanpa permulaan", "Kekal tanpa akhir", "Berdiri sendiri"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  14: [
    {
      id: 1401,
      level: 14,
      question: "Sifat wajib bagi Allah SWT 'Baqa' bermakna bahwa Allah...",
      options: ["Maha Kuasa", "Kekal abadi tanpa batas akhir", "Maha Mengetahui", "Tidak butuh bantuan"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  15: [
    {
      id: 1501,
      level: 15,
      question: "Dalam Fiqih Madzhab Syafi'i, berapakah jumlah rukun berwudhu yang wajib dipenuhi?",
      options: ["4 Rukun", "5 Rukun", "6 Rukun", "7 Rukun"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  16: [
    {
      id: 1601,
      level: 16,
      question: "Apakah rukun pertama dalam ibadah wudhu menurut madzhab Syafi'i?",
      options: ["Membasuh wajah", "Membasuh kedua tangan", "Niat berbarengan membasuh wajah", "Berkumur"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  17: [
    {
      id: 1701,
      level: 17,
      question: "Manakah hal di bawah ini yang membatalkan wudhu menurut Fiqih Syafi'i?",
      options: ["Makan daging kambing", "Tertawa terbahak-bahak", "Hilangnya akal sebab tidur lelap tanpa menetapkan pantat", "Menangis"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  18: [
    {
      id: 1801,
      level: 18,
      question: "Air yang telah digunakan bersuci untuk menghilangkan hadas wajib/kecil disebut...",
      options: ["Air Mutanajjis", "Air Musta'mal", "Air Mutahhir", "Air Musyammas"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  19: [
    {
      id: 1901,
      level: 19,
      question: "Siapakah salah satu tokoh utama perumus teologi Ahlussunnah wal Jama'ah (Aswaja)?",
      options: ["Imam Syafi'i", "Imam Abu al-Hasan al-Asy'ari", "Imam Ahmad bin Hanbal", "Imam Al-Ghazali"],
      correct: 1,
      category: "Aqidah Aswaja"
    }
  ],
  20: [
    {
      id: 2001,
      level: 20,
      question: "Sifat wajib bagi Rasul 'Siddiq' memiliki arti secara bahasa yaitu...",
      options: ["Maha Bijaksana", "Jujur / Benar", "Menyampaikan", "Cerdas"],
      correct: 1,
      category: "Sifat Rasul"
    }
  ],
  21: [
    {
      id: 2101,
      level: 21,
      question: "Menurut madzhab Imam Syafi'i, berapakah jumlah rukun dalam ibadah shalat?",
      options: ["13 Rukun", "15 Rukun", "17 Rukun", "12 Rukun"],
      correct: 0,
      category: "Fiqih Syafi'i"
    }
  ],
  22: [
    {
      id: 2201,
      level: 22,
      question: "Apakah rukun shalat yang pertama kali wajib dilakukan setelah berdiri tegak?",
      options: ["Membaca Al-Fatihah", "Membaca doa Iftitah", "Niat berbarengan Takbiratul Ihram", "Rukuk"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  23: [
    {
      id: 2301,
      level: 23,
      question: "Huruf-huruf qalqalah dikumpulkan dalam singkatan lafadz...",
      options: ["Yarmalun", "Baju Di Toko (Ba, Jim, Dal, Tha, Qaf)", "Yanmu", "Halqi"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  24: [
    {
      id: 2401,
      level: 24,
      question: "Berapakah jumlah huruf yang termasuk ke dalam kelompok hukum bacaan Izhar Halqi?",
      options: ["4 Huruf", "5 Huruf", "6 Huruf", "15 Huruf"],
      correct: 2,
      category: "Ilmu Tajwid"
    }
  ],
  25: [
    {
      id: 2501,
      level: 25,
      question: "Surat Al-Baqarah yang merupakan surat terpanjang dalam Al-Quran memiliki total...",
      options: ["200 Ayat", "286 Ayat", "110 Ayat", "176 Ayat"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  26: [
    {
      id: 2601,
      level: 26,
      question: "Ada berapakah jumlah ayat dalam Surat Yasin yang mulia?",
      options: ["78 Ayat", "83 Ayat", "96 Ayat", "110 Ayat"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  27: [
    {
      id: 2701,
      level: 27,
      question: "Berapakah jumlah ayat yang menyusun keindahan Surat Al-Kahf?",
      options: ["100 Ayat", "105 Ayat", "110 Ayat", "120 Ayat"],
      correct: 2,
      category: "Al-Quran"
    }
  ],
  28: [
    {
      id: 2801,
      level: 28,
      question: "Sifat wajib bagi Rasul 'Amanah' memiliki arti secara bahasa yaitu...",
      options: ["Cerdas", "Dapat Dipercaya", "Menyampaikan", "Berani"],
      correct: 1,
      category: "Sifat Rasul"
    }
  ],
  29: [
    {
      id: 2901,
      level: 29,
      question: "Sifat wajib bagi Rasul 'Tabligh' secara bahasa mengandung arti...",
      options: ["Menyembunyikan", "Menyampaikan wahyu", "Cerdas sekali", "Jujur"],
      correct: 1,
      category: "Sifat Rasul"
    }
  ],
  30: [
    {
      id: 3001,
      level: 30,
      question: "Sifat wajib bagi para Rasul 'Fathanah' memiliki arti...",
      options: ["Sabar", "Maksum", "Cerdas / Pintar", "Lemah Lembut"],
      correct: 2,
      category: "Sifat Rasul"
    }
  ],
  31: [
    {
      id: 3101,
      level: 31,
      question: "Lawan atau sifat mustahil dari sifat 'Qidam' bagi Allah SWT adalah...",
      options: ["Fana (Rusak)", "Huduts (Baru / Ada permulaan)", "Mautun", "Ajzun"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  32: [
    {
      id: 3201,
      level: 32,
      question: "Apakah sifat mustahil bagi Allah SWT yang merupakan kebalikan dari sifat 'Baqa'?",
      options: ["Maut (Mati)", "Fana (Rusak / Berakhir)", "Jahlun", "Bukumun"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  33: [
    {
      id: 3301,
      level: 33,
      question: "Hukum membaca Mad Thabi'i secara standar dibaca sepanjang...",
      options: ["1 Harakat", "2 Harakat (1 Alif)", "4 Harakat", "6 Harakat"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  34: [
    {
      id: 3401,
      level: 34,
      question: "Hukum bacaan Mad Wajib Muttasil terjadi ketika Mad Thabi'i bertemu dengan Hamzah di dalam...",
      options: ["Kata yang berbeda", "Kata yang sama (satu kata)", "Akhir kalimat", "Awal kalimat"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  35: [
    {
      id: 3501,
      level: 35,
      question: "Hukum bacaan Mad Jaiz Munfasil terjadi apabila Mad Thabi'i bertemu Hamzah di...",
      options: ["Dua kalimat terpisah", "Satu kalimat yang sama", "Tengah ayat", "Sujud tilawah"],
      correct: 0,
      category: "Ilmu Tajwid"
    }
  ],
  36: [
    {
      id: 3601,
      level: 36,
      question: "Berapakah batas minimal (nisab) kepemilikan emas wajib zakat dalam setahun menurut fiqih?",
      options: ["70 Gram", "85 Gram", "94 Gram", "100 Gram"],
      correct: 1,
      category: "Zakat"
    }
  ],
  37: [
    {
      id: 3701,
      level: 37,
      question: "Berapakah batas minimal (nisab) kepemilikan perak wajib zakat menurut para ulama madzhab?",
      options: ["500 Gram", "595 Gram", "650 Gram", "720 Gram"],
      correct: 1,
      category: "Zakat"
    }
  ],
  38: [
    {
      id: 3801,
      level: 38,
      question: "Salah satu pilar Aswaja adalah 'Tawasuth'. Apakah makna tawasuth secara istilah?",
      options: ["Berseberangan", "Sikap tengah-tengah / moderat", "Sikap kaku", "Pasrah total"],
      correct: 1,
      category: "Pilar Aswaja"
    }
  ],
  39: [
    {
      id: 3901,
      level: 39,
      question: "Dalam prinsip Ahlussunnah wal Jama'ah, istilah 'Tawazun' bermakna...",
      options: ["Sikap fanatik", "Sikap seimbang dalam segala hal", "Pasrah tanpa usaha", "Sikap acuh tak acuh"],
      correct: 1,
      category: "Pilar Aswaja"
    }
  ],
  40: [
    {
      id: 4001,
      level: 40,
      question: "Dalam akidah Tauhid, berapakah jumlah sifat Jaiz bagi Allah SWT?",
      options: ["1 Sifat", "2 Sifat", "20 Sifat", "50 Sifat"],
      correct: 0,
      category: "Aqidah"
    }
  ],
  41: [
    {
      id: 4101,
      level: 41,
      question: "Sujud tambahan karena lupa rukun atau ragu rakaat shalat disebut sujud...",
      options: ["Sujud Syukur", "Sujud Sahwi", "Sujud Tilawah", "Sujud Sahda"],
      correct: 1,
      category: "Fiqih Sholat"
    }
  ],
  42: [
    {
      id: 4201,
      level: 42,
      question: "Kapan pelaksanaan Sujud Sahwi yang paling utama dilakukan menurut madzhab Syafi'i?",
      options: ["Setelah salam pertama", "Sebelum melakukan salam", "Saat teringat di luar shalat", "Ketika rukuk pertama"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  43: [
    {
      id: 4301,
      level: 43,
      question: "Sujud yang dilakukan ketika mendengar atau membaca ayat-ayat sajdah dinamakan...",
      options: ["Sujud Syukur", "Sujud Tilawah", "Sujud Sahwi", "Sujud Rukun"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  44: [
    {
      id: 4401,
      level: 44,
      question: "Berapakah jumlah total ayat sajdah yang terdapat di dalam Al-Quran?",
      options: ["10 Ayat", "12 Ayat", "15 Ayat", "30 Ayat"],
      correct: 2,
      category: "Al-Quran"
    }
  ],
  45: [
    {
      id: 4501,
      level: 45,
      question: "Apakah nama surat di Al-Quran yang sama sekali tidak diawali oleh lafadz Basmalah?",
      options: ["Surat Al-Kahf", "Surat At-Tawbah", "Surat An-Naml", "Surat Al-Mulk"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  46: [
    {
      id: 4601,
      level: 46,
      question: "Berdasarkan sejarah dan lokasi turunnya, surat Al-Kahf tergolong dalam golongan surat...",
      options: ["Surat Madaniyah", "Surat Makkiyah", "Surat Kufiyyah", "Surat Syamiyyah"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  47: [
    {
      id: 4701,
      level: 47,
      question: "Surat Al-Baqarah yang agung diturunkan setelah Rasulullah SAW hijrah, sehingga termasuk surat...",
      options: ["Makkiyah", "Madaniyah", "Arafiyyah", "Qudsiyah"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  48: [
    {
      id: 4801,
      level: 48,
      question: "Surat apakah dalam Al-Quran yang dijuluki sebagai 'Jantungnya Al-Quran' (Qalbul Quran)?",
      options: ["Surat Al-Fatihah", "Surat Yasin", "Surat Al-Ikhlas", "Surat Ar-Rahman"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  49: [
    {
      id: 4901,
      level: 49,
      question: "Surat Al-Quran yang dijuluki sebagai 'Pengantin Al-Quran' (Arustul Quran) karena keindahannya adalah...",
      options: ["Surat Al-Mulk", "Surat Ar-Rahman", "Surat Al-Waqi'ah", "Surat Yusuf"],
      correct: 1,
      category: "Al-Quran"
    }
  ],
  50: [
    {
      id: 5001,
      level: 50,
      question: "Apakah sifat jaiz yang dimiliki oleh para utusan Allah (Rasul)?",
      options: ["Al-A'radhul Basyariyah (sifat kemanusiaan biasa)", "Ma'sum (terjaga dari dosa)", "Malaikatul Arsy", "Al-Ishmah"],
      correct: 0,
      category: "Sifat Rasul"
    }
  ],
  51: [
    {
      id: 5101,
      level: 51,
      question: "Dalam Ilmu Tajwid, hukum bacaan Mad Lazim Kilmi Muthaqqal wajib dibaca sepanjang...",
      options: ["2 Harakat", "4 Harakat", "6 Harakat (3 Alif)", "8 Harakat"],
      correct: 2,
      category: "Ilmu Tajwid"
    }
  ],
  52: [
    {
      id: 5201,
      level: 52,
      question: "Air kurang dari dua qullah yang terkena najis meskipun tidak berubah bau, rasa, atau warnanya disebut...",
      options: ["Air Musta'mal", "Air Mutanajjis", "Air Musyammas", "Air Thahir"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  53: [
    {
      id: 5301,
      level: 53,
      question: "Ukuran volume 'Dua Qullah' standar madzhab Syafi'i jika dikonversi ke liter modern berkisar sekitar...",
      options: ["100 Liter", "150 Liter", "216 Liter", "500 Liter"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  54: [
    {
      id: 5401,
      level: 54,
      question: "Berapa jumlah jamaah minimum agar shalat Jumat dianggap sah menurut madzhab Imam Syafi'i?",
      options: ["12 orang", "40 orang yang memenuhi syarat jumat", "2 orang", "300 orang"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  55: [
    {
      id: 5501,
      level: 55,
      question: "Diperbolehkan menjamak dan mengqashar sholat bagi musafir yang menempuh jarak minimal...",
      options: ["2 Farsakh", "16 Farsakh (sekitar 82-89 km)", "50 km", "30 Farsakh"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  56: [
    {
      id: 5601,
      level: 56,
      question: "Membagi harta warisan dalam Islam disebut ilmu faraidh. Istilah ashabah dalam ilmu faraidh adalah...",
      options: ["Ahli waris bagian pasti", "Ahli waris penerima sisa harta", "Ahli waris yang terhalang", "Pihak luar"],
      correct: 1,
      category: "Ilmu Faraidh"
    }
  ],
  57: [
    {
      id: 5701,
      level: 57,
      question: "Sifat wajib Allah 'Mukhalafatuhu lil-hawaditsi' berarti Allah SWT...",
      options: ["Maha Mendengar", "Berbeda dengan segala yang baru (makhluk-Nya)", "Berdiri sendiri", "Berkuasa"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  58: [
    {
      id: 5801,
      level: 58,
      question: "Sifat wajib Allah 'Qiyamuhu Binafsihi' secara bahasa berarti Allah...",
      options: ["Maha Esa", "Berdiri sendiri tanpa membutuhkan bantuan lain", "Kekal", "Hidup"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  59: [
    {
      id: 5901,
      level: 59,
      question: "Sifat wajib Allah 'Wahdaniyah' bermakna bahwa Allah...",
      options: ["Tunggal / Esa pada dzat, sifat, dan perbuatan-Nya", "Maha Kuasa", "Maha Melihat", "Berbicara"],
      correct: 0,
      category: "Sifat 20"
    }
  ],
  60: [
    {
      id: 6001,
      level: 60,
      question: "Sikap 'I'tidal' dalam Aswaja berarti...",
      options: ["Sikap ekstrim", "Sikap tegak lurus dan berlaku adil", "Menyerah", "Pasrah"],
      correct: 1,
      category: "Pilar Aswaja"
    }
  ],
  61: [
    {
      id: 6101,
      level: 61,
      question: "Jika nun suci atau tanwin bertemu dengan huruf Laam (ل) atau Ra (ر), hukumnya adalah...",
      options: ["Idgham Bighunnah", "Idgham Bilaghunnah", "Iqlab", "Ikhfa Syafawi"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  62: [
    {
      id: 6201,
      level: 62,
      question: "Bila nun suci bertemu dengan huruf Ya, Nun, Mim, atau Wau, dinamakan hukum...",
      options: ["Izhar", "Idgham Bilaghunnah", "Idgham Bighunnah", "Iqlab"],
      correct: 2,
      category: "Ilmu Tajwid"
    }
  ],
  63: [
    {
      id: 6301,
      level: 63,
      question: "Rukun ibadah haji yang membedakannya secara mutlak dengan ibadah umrah adalah...",
      options: ["Thawaf", "Wukuf di Padang Arafah", "Sa'i", "Ihram"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  64: [
    {
      id: 6401,
      level: 64,
      question: "Berapa jumlah rukun haji yang disepakati dalam Madzhab Syafi'i?",
      options: ["4 rukun", "5 rukun", "6 rukun", "7 rukun"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  65: [
    {
      id: 6501,
      level: 65,
      question: "Sholat jenazah wajib dikerjakan dengan melakukan takbir sebanyak...",
      options: ["2 kali takbir", "3 kali takbir", "4 kali takbir", "5 kali takbir"],
      correct: 2,
      category: "Fiqih Syafi'i"
    }
  ],
  66: [
    {
      id: 6601,
      level: 66,
      question: "Bacaan apakah yang wajib dibaca makmum setelah takbir kedua pada sholat jenazah?",
      options: ["Surat Al-Fatihah", "Sholawat atas Nabi SAW", "Doa bagi si mayit", "Doa Iftitah"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  67: [
    {
      id: 6701,
      level: 67,
      question: "Setelah melakukan takbir ketiga pada sholat jenazah, rukun selanjutnya adalah membaca...",
      options: ["Doa kebaikan bagi si mayit", "Sholawat nabi", "Surat pendek Al-Quran", "Istighfar"],
      correct: 0,
      category: "Fiqih Syafi'i"
    }
  ],
  68: [
    {
      id: 6801,
      level: 68,
      question: "Sifat mustahil bagi Rasul 'Kizib' memiliki arti...",
      options: ["Berdusta / Berbohong", "Berkhianat", "Bodoh", "Menyembunyikan wahyu"],
      correct: 0,
      category: "Sifat Rasul"
    }
  ],
  69: [
    {
      id: 6901,
      level: 69,
      question: "Sifat mustahil bagi Rasul 'Khianat' bermakna...",
      options: ["Berdusta", "Ingkar / Tidak dapat dipercaya", "Menyembunyikan", "Bodoh"],
      correct: 1,
      category: "Sifat Rasul"
    }
  ],
  70: [
    {
      id: 7001,
      level: 70,
      question: "Sifat mustahil bagi Rasul 'Kitman' bermakna bahwa Rasul mustahil...",
      options: ["Lupa", "Menyembunyikan kebenaran/wahyu", "Sakit parah", "Bodoh"],
      correct: 1,
      category: "Sifat Rasul"
    }
  ],
  71: [
    {
      id: 7101,
      level: 71,
      question: "Riba yang terjadi akibat adanya syarat bunga/tambahan pada transaksi hutang piutang disebut...",
      options: ["Riba Fadhl", "Riba Qardh", "Riba Nasi'ah", "Riba Yad"],
      correct: 1,
      category: "Fiqih Muamalah"
    }
  ],
  72: [
    {
      id: 7201,
      level: 72,
      question: "Sifat mustahil bagi Rasul 'Baladah' memiliki makna bahasa yaitu...",
      options: ["Kerdil", "Bodoh / Lamban", "Bisu", "Pengecut"],
      correct: 1,
      category: "Sifat Rasul"
    }
  ],
  73: [
    {
      id: 7301,
      level: 73,
      question: "Siapakah nama ulama besar penyusun kitab tasawuf fenomenal 'Ihya Ulumuddin'?",
      options: ["Imam Syafi'i", "Imam Al-Ghazali", "Imam Junaid al-Baghdadi", "Syaikh Abdul Qadir Al-Jilani"],
      correct: 1,
      category: "Tasawuf Aswaja"
    }
  ],
  74: [
    {
      id: 7401,
      level: 74,
      question: "Dalam thariqah Aswaja, siapa salah satu imam rujukan utama dalam tasawuf selain Al-Ghazali?",
      options: ["Imam Abu Hanifah", "Imam Junaid al-Baghdadi", "Imam Hasan al-Basri", "Syaikh Ibnu Athaillah"],
      correct: 1,
      category: "Tasawuf Aswaja"
    }
  ],
  75: [
    {
      id: 7501,
      level: 75,
      question: "Wahyu pertama kali diturunkan kepada Rasulullah SAW di Gua Hira, yaitu surat...",
      options: ["Al-Fatihah ayat 1-7", "Al-Alaq ayat 1-5", "Al-Muddassir ayat 1-7", "Al-Baqarah ayat 1-5"],
      correct: 1,
      category: "Sejarah Al-Quran"
    }
  ],
  76: [
    {
      id: 7601,
      level: 76,
      question: "Di manakah lokasi letak bukit yang di dalamnya terdapat Gua Hira tempat menyendiri nabi?",
      options: ["Jabal Uhud", "Jabal Nur", "Jabal Rahmah", "Jabal Tursina"],
      correct: 1,
      category: "Sirah Nabawiyah"
    }
  ],
  77: [
    {
      id: 7701,
      level: 77,
      question: "Siapakah nama Nabi yang ditelan oleh ikan paus raksasa dalam samudera?",
      options: ["Nabi Nuh AS", "Nabi Yunus AS", "Nabi Ibrahim AS", "Nabi Yusuf AS"],
      correct: 1,
      category: "Kisah Nabi"
    }
  ],
  78: [
    {
      id: 7801,
      level: 78,
      question: "Siapakah Nabi yang dianugerahi mukjizat berbicara dengan hewan dan menguasai bangsa Jin?",
      options: ["Nabi Daud AS", "Nabi Sulaiman AS", "Nabi Isa AS", "Nabi Musa AS"],
      correct: 1,
      category: "Kisah Nabi"
    }
  ],
  79: [
    {
      id: 7901,
      level: 79,
      question: "Nabi manakah yang dibakar dalam api menyala oleh Raja Namrud namun tetap dingin?",
      options: ["Nabi Musa AS", "Nabi Ibrahim AS", "Nabi Nuh AS", "Nabi Luth AS"],
      correct: 1,
      category: "Kisah Nabi"
    }
  ],
  80: [
    {
      id: 8001,
      level: 80,
      question: "Nabi yang dianugerahi ujian kesabaran yang luar biasa atas penyakit kulit tahunan adalah...",
      options: ["Nabi Ayyub AS", "Nabi Yusuf AS", "Nabi Zakaria AS", "Nabi Ya'qub AS"],
      correct: 0,
      category: "Kisah Nabi"
    }
  ],
  81: [
    {
      id: 8101,
      level: 81,
      question: "Siapakah nama pengarang (mushannif) dari kitab fiqih ringkas populer 'Safinatun Najah'?",
      options: ["Syaikh Salim bin Samir Al-Hadhrami", "Syaikh Nawawi Al-Bantani", "Imam Nawawi", "Syaikh Sulaiman Al-Bujairimi"],
      correct: 0,
      category: "Khazanah Kitab"
    }
  ],
  82: [
    {
      id: 8201,
      level: 82,
      question: "Syarah fiqih legendaris 'Fathul Qarib Al-Mujib' ditulis oleh ulama besar bernama...",
      options: ["Imam Ibnu Hajar Al-Asqalani", "Syaikh Muhammad bin Qasim Al-Ghazi", "Imam Syafi'i", "Syaikh Zakaria Al-Anshari"],
      correct: 1,
      category: "Khazanah Kitab"
    }
  ],
  83: [
    {
      id: 8301,
      level: 83,
      question: "Kitab tafsir agung 'Tafsir Jalalain' disusun oleh dua ulama bergelar Jalaluddin, yaitu...",
      options: ["Al-Mahalli & As-Suyuthi", "Al-Ghazali & Al-Bukhari", "At-Tabari & Al-Qurthubi", "Ibnu Katsir & Al-Baghdadi"],
      correct: 0,
      category: "Khazanah Kitab"
    }
  ],
  84: [
    {
      id: 8401,
      level: 84,
      question: "Sifat wajib bagi Allah 'Sama' ' bermakna secara hakiki bahwa Allah Maha...",
      options: ["Melihat", "Mendengar", "Berbicara", "Berkuasa"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  85: [
    {
      id: 8501,
      level: 85,
      question: "Sifat wajib bagi Allah 'Bashar' bermakna secara hakiki bahwa Allah Maha...",
      options: ["Mendengar", "Melihat", "Berbicara", "Mengetahui"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  86: [
    {
      id: 8601,
      level: 86,
      question: "Sifat wajib bagi Allah 'Kalam' bermakna secara hakiki bahwa Allah...",
      options: ["Hidup", "Berfirman / Berbicara tanpa suara dan huruf", "Mendengar", "Satu"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  87: [
    {
      id: 8701,
      level: 87,
      question: "Dalam nadham kitab 'Aqidatul Awam', berapakah sifat wajib bagi Allah yang wajib diyakini mukallaf?",
      options: ["10 Sifat", "20 Sifat", "41 Sifat", "50 Sifat"],
      correct: 1,
      category: "Aqidah"
    }
  ],
  88: [
    {
      id: 8801,
      level: 88,
      question: "Siapakah pengarang/penyusun bait nadham kitab tauhid dasar 'Aqidatul Awam'?",
      options: ["Syaikh Ahmad Al-Marzuqi", "Syaikh Yusuf Al-Nabhani", "Syaikh Salim Al-Hadhrami", "Imam Haromain"],
      correct: 0,
      category: "Khazanah Kitab"
    }
  ],
  89: [
    {
      id: 8901,
      level: 89,
      question: "Pertemuan dua huruf tajwid yang sama makhrajnya namun berbeda sifatnya dinamakan...",
      options: ["Idgham Mutamatsilain", "Idgham Mutajanisain", "Idgham Mutaqaribain", "Idgham Syafawi"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  90: [
    {
      id: 9001,
      level: 90,
      question: "Pertemuan dua huruf tajwid yang makhraj dan sifatnya saling berdekatan disebut...",
      options: ["Idgham Mutamatsilain", "Idgham Mutaqaribain", "Idgham Mutajanisain", "Izhar Halqi"],
      correct: 1,
      category: "Ilmu Tajwid"
    }
  ],
  91: [
    {
      id: 9101,
      level: 91,
      question: "Berapa jumlah sumber dalil hukum Islam yang disepakati (Ijma') dalam madzhab Syafi'i?",
      options: ["2 Sumber (Quran & Hadis)", "4 Sumber (Quran, Hadis, Ijma', Qiyas)", "3 Sumber", "5 Sumber"],
      correct: 1,
      category: "Ushul Fiqih"
    }
  ],
  92: [
    {
      id: 9201,
      level: 92,
      question: "Manakah di bawah ini yang tergolong dalam bagian 'Sunnah Ab'ad' dalam ibadah Sholat?",
      options: ["Membaca doa Iftitah", "Membaca Qunut pada sholat Subuh", "Membaca surat pendek", "Takbir intiqal"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  93: [
    {
      id: 9301,
      level: 93,
      question: "Apabila seseorang sengaja atau lupa meninggalkan salah satu 'Sunnah Ab'ad' dalam sholat, disunnahkan ganti dengan...",
      options: ["Membatalkan Sholat", "Sujud Sahwi sebelum salam", "Mengulang Rakaat", "Istighfar"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  94: [
    {
      id: 9401,
      level: 94,
      question: "Dalam Fiqih Syafi'i, berapa banyakkah total syarat diperbolehkannya qashar shalat?",
      options: ["5 syarat", "7 syarat", "9 syarat", "12 syarat"],
      correct: 1,
      category: "Fiqih Syafi'i"
    }
  ],
  95: [
    {
      id: 9501,
      level: 95,
      question: "Darah yang keluar dari rahim seorang wanita setelah melahirkan (wiladah) dinamakan...",
      options: ["Darah Istihadlah", "Darah Nifas", "Darah Haid", "Darah Syubhat"],
      correct: 1,
      category: "Fiqih Wanita"
    }
  ],
  96: [
    {
      id: 9601,
      level: 96,
      question: "Berapakah batas waktu maksimal masa haid bagi wanita menurut Madzhab Syafi'i?",
      options: ["7 hari 7 malam", "15 hari 15 malam", "10 hari 10 malam", "40 hari"],
      correct: 1,
      category: "Fiqih Wanita"
    }
  ],
  97: [
    {
      id: 9701,
      level: 97,
      question: "Berapakah batas waktu paling minimal masa suci di antara dua siklus haid dalam Syafi'iyah?",
      options: ["10 Hari", "15 Hari", "20 Hari", "7 Hari"],
      correct: 1,
      category: "Fiqih Wanita"
    }
  ],
  98: [
    {
      id: 9801,
      level: 98,
      question: "Sifat 'Ma'ani' Allah SWT terdiri atas 7 sifat. Manakah sifat yang TIDAK termasuk sifat Ma'ani?",
      options: ["Qudrat", "Hayat", "Kaunuhu Qadiran", "Ilmu"],
      correct: 2,
      category: "Sifat 20"
    }
  ],
  99: [
    {
      id: 9901,
      level: 99,
      question: "Sifat 'Ma'nawiyah' Allah SWT berjumlah 7 sifat. Manakah sifat di bawah ini yang termasuk sifat Ma'nawiyah?",
      options: ["Kalam", "Kaunuhu 'Aliman", "Sama'", "Bashar"],
      correct: 1,
      category: "Sifat 20"
    }
  ],
  100: [
    {
      id: 10001,
      level: 100,
      question: "Kitab fiqih komparatif raksasa 'Al-Majmu' Syarh Al-Muhadzdzab' ditulis oleh tokoh madzhab Syafi'i agung yaitu...",
      options: ["Imam Al-Ghazali", "Imam An-Nawawi", "Imam Ar-Rafi'i", "Imam Syafii"],
      correct: 1,
      category: "Ulama Syafi'iyah"
    }
  ]
};
