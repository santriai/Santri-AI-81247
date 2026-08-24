import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Home, 
  HandHeart, 
  Scale, 
  ShieldCheck, 
  Baby, 
  Flame, 
  Search, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Crown, 
  BookHeart, 
  ShieldAlert, 
  ChevronRight, 
  Copy, 
  Check, 
  Share2, 
  CheckCircle2, 
  HelpCircle, 
  BookMarked,
  Lightbulb,
  BookOpen,
  Compass,
  Smile,
  Shield,
  BookText,
  Star,
  Flag
} from 'lucide-react';
import { PLAYSTORE_LINK } from '../constants';
import { openExternalLink } from '../utils/linkUtils';
import { ContentReportModal } from '../components/ContentReportModal';
import { useToast } from '../contexts/ToastContext';

export interface SourceInfo {
  type: 'Al-Qur\'an' | 'Hadits Shahih' | 'Kitab Kuning' | 'Pendapat Ulama';
  title: string;
  authorOrRef: string;
  detailLocation: string; // Misal: "Juz 2, Halaman 45, Bab Adab An-Nikah"
}

export interface DetailSection {
  heading: string;
  narrativeIntro?: string; // Muqaddimah hangat & tidak kaku
  text?: string;
  bullets?: string[];
  examples?: string[]; // Contoh Nyata Sehari-hari (Kasus Keseharian)
  arabic?: string;
  latin?: string;
  translation?: string;
  source?: SourceInfo;
  ibarahNote?: string; // Pencerahan Fiqih, Ibarah Kitab & Prinsip Kehati-hatian
}

export interface MarriageTopic {
  id: string;
  title: string;
  category: 'Kisah Nabi' | 'Parenting' | 'Fiqih Nikah' | 'Doa & Adab' | 'Masalah & Solusi' | 'Panduan Samawa';
  description: string;
  icon: any;
  bgGradient: string;
  badge: string;
  content: {
    summary: string;
    sections: DetailSection[];
    tips?: string[];
  };
}

const MARRIAGE_TOPICS: MarriageTopic[] = [
  {
    id: 'kumpulan-kitab-hadits',
    title: 'Kumpulan Kitab Kuning & Hadits Shahih Seputar Rumah Tangga',
    category: 'Doa & Adab',
    description: 'Rujukan utama pesantren & madrasah: Kitab Qurrotul Uyun, \'Uqudul Lujain, Dhaw-ul Mishbah, Fathul Mu\'in, Ihya \'Ulumiddin, & Sanad Hadits Shahih.',
    icon: BookOpen,
    bgGradient: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800',
    badge: 'Perpustakaan Kitab',
    content: {
      summary: 'Berikut adalah kumpulan rujukan kitab-kitab Fiqih Munakahat klasik (Kitab Kuning) serta Sanad Hadits Shahih yang menjadi pegangan para ulama dan santri dalam memahami pondasi syariat, keharmonisan, serta hukum-hukum praktis dalam membina rumah tangga Sakinah, Mawaddah, wa Rahmah.',
      sections: [
        {
          heading: '1. Kitab Qurrotul Uyun (قرّة العيون) - Karya Syekh Muhammad at-Tihami',
          narrativeIntro: 'Kitab permata dalam pesantren yang membahas Fiqih pernikahan, etika pergaulan pasutri, serta seni membangun kasih sayang suci.',
          text: 'FOKUS PEMBAHASAN: Kitab ini menguraikan secara lembut dan terperinci mengenai tata cara akad, malam pertama, adab hubungan intim (jima\'), doa-doa mustajab, serta pembentukan karakter dan spiritualitas calon anak sejak sebelum pembuahan.',
          examples: [
            'Adab mengawali perjumpaan malam pertama dengan wudhu, sholat sunnah 2 rakaat berjamah pasutri, dan memegang ubun-ubun istri sambil membaca doa keberkahan.',
            'Pemilihan waktu-waktu utama bersetubuh (seperti malam Jumat) dan larangan bersetubuh saat haid atau dari jalur belakang (dubur).'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Qurrotul Uyun bi Syarhi Nazham Ibn Yamun',
            authorOrRef: 'Syekh Muhammad at-Tihami bin Madani (Wafat 1331 H)',
            detailLocation: 'Fasl fi Adabi an-Nikah wal Jima\', Halaman 15-45'
          },
          ibarahNote: 'PENCERAHAN ULAMA: Kitab ini menekankan bahwa hubungan biologis suami istri bukan sekadar pelampiasan syahwat, melainkan ibadah berpahala sedekah yang dibentengi doa agar tidak dicampuri pengaruh setan.'
        },
        {
          heading: '2. Kitab \'Uqudul Lujain (عقود اللجين) - Karya Syekh Nawawi Al-Bantani',
          narrativeIntro: 'Kitab wajib santri karangan Mahaguru Ulama Nusantara di Makkah yang mengupas tuntas hak dan kewajiban timbal balik antara suami dan istri.',
          text: 'FOKUS PEMBAHASAN: Terdiri dari 4 bab utama: (1) Hak-hak istri atas suami, (2) Hak-hak suami atas istri, (3) Keutamaan sholat dan menjaga aurat bagi wanita di rumah, (4) Peringatan dosa-dosa KDRT dan nusyuz.',
          arabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قِيلَ لِرَسُولِ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: أَيُّ النِّسَاءِ خَيْرٌ؟ قَالَ: الَّتِي تَسُرُّهُ إِذَا نَظَرَ، وَتُطِيعُهُ إِذَا أَمَرَ، وَلاَ تُخَالِفُهُ فِي نَفْسِهَا وَمَالِهَا بِمَا يَكْرَهُ',
          latin: 'An Abi Hurairah qala: Qila lirasulillahi SAW: Ayyun-nisai khairun? Qala: Allati tasurruhu izha nazhara, wa tuti\'uhu izha amara, wa la tukhalifuhu fi nafsiha wa maliha bima yakrah.',
          translation: '"Dari Abu Hurairah RA, ditanyakan kepada Rasulullah SAW: Wanita bagaimanakah yang paling baik? Beliau menjawab: Wanita yang menyenangkan suaminya jika dipandang, menatatinya jika diperintah, dan tidak menyelisihi suaminya pada diri dan hartanya dengan hal yang dibenci suaminya..."',
          source: {
            type: 'Kitab Kuning',
            title: '\'Uqudul Lujain fi Bayani Huquqiz Zaujayn',
            authorOrRef: 'Syekh Muhammad Nawawi bin Umar Al-Bantani Al-Jawi (1813-1897 M)',
            detailLocation: 'Bab I & II, Halaman 2-18'
          }
        },
        {
          heading: '3. Kitab Dhaw-ul Mishbah (ضوء المصباح) - Karya Hadratussyeikh KH. Hasyim Asy\'ari',
          narrativeIntro: 'Risalah Fiqih Munakahat berbahasa Arab karya Pendiri Nahdlatul Ulama yang memadukan hukum fiqih dengan kearifan sosial.',
          text: 'FOKUS PEMBAHASAN: Menjelaskan rukun dan syarat sah nikah, tata cara ijab qabul, posisi wali nasab, bahaya nikah tanpa wali, serta pentingnya mencatatkan pernikahan untuk menjaga hak kemaslahatan istri dan anak.',
          source: {
            type: 'Kitab Kuning',
            title: 'Dhaw-ul Mishbah fi Bayani Ahkamin Nikah',
            authorOrRef: 'Hadratussyeikh KH. M. Hasyim Asy\'ari (Pendiri NU, 1875-1947 M)',
            detailLocation: 'Fasl fi Shuruthin Nikah wal Wali, Halaman 10-30'
          }
        },
        {
          heading: '4. Kitab Ihya \'Ulumiddin (إحياء علوم الدين) - Karya Hujjatul Islam Imam Al-Ghazali',
          narrativeIntro: 'Rujukan tasawuf dan kebersihan jiwa dalam membina keluarga dari monumen karya Imam Al-Ghazali.',
          text: 'FOKUS PEMBAHASAN: Bab Kitab Adab An-Nikah mengupas bahaya membujang tanpa uzur, faedah pernikahan dalam membentengi mata dan kemaluan, manajemen emosi saat terjadi selisih paham, serta etika memperlakukan istri dengan penuh kesabaran dan kelembutan.',
          source: {
            type: 'Kitab Kuning',
            title: 'Ihya \'Ulumiddin (Juz 2: Kitab Adab an-Nikah)',
            authorOrRef: 'Imam Abu Hamid Muhammad Al-Ghazali (450-505 H)',
            detailLocation: 'Juz 2, Halaman 22-68'
          }
        },
        {
          heading: '5. Shahih Al-Bukhari & Shahih Muslim - Bab An-Nikah & Husnul \'Asyirah',
          narrativeIntro: 'Kumpulan hadits-hadits shahih tingkat tertinggi seputar perlakuan Rasulullah SAW kepada keluarga.',
          arabic: 'خَيْرُكُمْ خَيْرُكُمْ لأَهْلِهِ وَأَنَا خَيْرُكُمْ لأَهْلِي',
          latin: 'Khairukum khairukum li-ahlihi wa ana khairukum li-ahli.',
          translation: '"Sebaik-baik kalian adalah yang paling baik perlakuan dan sikapnya kepada keluarganya (istrinya), dan aku adalah orang yang paling baik perlakuan dan sikapnya di antara kalian kepada keluargaku."',
          source: {
            type: 'Hadits Shahih',
            title: 'Sunan At-Tirmidzi & Sunan Ibn Majah (Sanad Shahih)',
            authorOrRef: 'Imam At-Tirmidzi & Imam Ibn Majah',
            detailLocation: 'Kitab Al-Manaqib, Bab Fadhli Azwajin Nabiy, No. Hadits 3895'
          }
        }
      ],
      tips: [
        'Pelajari kitab-kitab Fiqih Munakahat di bawah bimbingan Guru/Kiai yang bersanad.',
        'Jadikan dalil dan sabda Nabi SAW sebagai rujukan utama saat terjadi perbedaan pendapat dalam rumah tangga.'
      ]
    }
  },
  {
    id: 'seputar-mahar',
    title: 'Seputar Mahar (Mas Kawin) & Hukum Praktisnya',
    category: 'Fiqih Nikah',
    description: 'Panduan tuntas 5W1H: Hakikat mahar, siapa pemiliknya, hukum suami pakai sajadah mahar, mahar hutang, uang resepsi, & pembagian saat cerai.',
    icon: HandHeart,
    bgGradient: 'bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700',
    badge: 'Harta & Hak Istri',
    content: {
      summary: 'Mahar (Mas Kawin) adalah pemberian wajib dari calon suami kepada calon istri sebagai simbol ketulusan, penghormatan murni, dan jaminan awal kerelaan akad nikah. Memahami status hukum mahar sangat krusial dalam rumah tangga karena melibatkan batas hak milik harta yang sangat tegas dan mengikat dalam Syariat Islam.',
      sections: [
        {
          heading: '1. APA itu Mahar & APA Saja yang Boleh Dijadikan Mahar?',
          narrativeIntro: 'Banyak pengantin baru menganggap mahar sekadar formalitas syarat administratif pernikahan atau hiasan pigura. Padahal dalam Fiqih Islam, mahar adalah simbol pertama perlakuan mulia seorang laki-laki kepada wanita yang dinikahinya.',
          text: 'APA DEFINISINYA: Mahar adalah harta atau jasa bernilai yang wajib diserahkan oleh suami kepada istri karena berlangsungnya akad nikah yang sah. APA SAJA YANG BOLEH: Segala sesuatu yang bernilai harta (mutaqawwam) menurut syariat Islam, seperti emas batangan, uang tunai, perhiasan, tanah, kendaraan, maupun jasa bernilai seperti pengajaran Al-Qur\'an.',
          arabic: 'وَآتُوا النِّسَاءَ صَدُقَاتِهِنَّ نِحْلَةً فَإِن طِبْنَ لَكُمْ عَن شَيْءٍ مِّنْهُ نَفْسًا فَكُلُوهُ هَنِيئًا مَّرِيئًا',
          latin: 'Wa aatun-nisaa\'a shaduqaatihinna nihlah, fa in thibna lakum \'an syai-im minhu nafsan fakuluhu hanii-am marii-a.',
          translation: '"Dan berikanlah mas kawin (mahar) kepada perempuan (yang kamu nikahi) sebagai pemberian yang penuh kerelaan. Kemudian jika mereka menyerahkan kepada kamu sebagian dari mas kawin itu dengan senang hati, maka makanlah (ambillah) pemberian itu sebagai makanan yang enak lagi baik akibatnya..."',
          examples: [
            'Emas batangan atau perhiasan murni (misal: emas 10 gram).',
            'Uang tunai dengan nominal tertentu.',
            'Seperangkat alat sholat (mukenah, sajadah, Al-Qur\'an).',
            'Jasa mengajarkan Surah Al-Baqarah atau hafalan Al-Qur\'an.'
          ],
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah An-Nisa Ayat 4',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 4, Surah Ke-4, Ayat 4 (Tafsir Al-Qurtubi Juz 5 Hlm 24)'
          },
          ibarahNote: 'MENGAPA disyariatkan? Mahar bukan harga pembelian wanita, melainkan bukti ketulusan cinta dan kesiapan suami menanggung nafkah lahir batin secara penuh.'
        },
        {
          heading: '2. SIAPA Pemilik Mutlak Mahar? (Bolehkah Orang Tua atau Suami Mengambilnya?)',
          narrativeIntro: 'Sering terjadi kerancuan di masyarakat di mana orang tua pengantin wanita atau suami merasa berhak menguasai harta mahar.',
          text: 'SIAPA PEMILIKNYA: Mahar adalah HAK MILIK MURNI & MUTLAK dari Istri 100%. Tidak ada seorang pun—termasuk suami, ayah kandung, ibu, maupun mertua—yang berhak mengambil, menjual, atau menggunakan harta mahar tersebut tanpa izin dan kerelaan (ridha) ikhlas dari sang istri.',
          examples: [
            'KASUS UANG RESEPSI: Apabila orang tua pengantin wanita mengambil uang mahar untuk menutupi biaya katering atau sewa gedung resepsi TANPA kerelaan ikhlas dari pengantin wanita, maka hukumnya HARAM dan merupakan pemakanan harta secara bathil.',
            'KASUS SUAMI MEMINJAM MAHAR: Jika suami sedang terdesak ekonomi lalu berniat menjual perhiasan mahar istri, suami Wajib meminta izin istri secara terbuka dan Wajib menggantinya kelak, kecuali jika istri menghilangkannya/merelakannya sebagai hadiah.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Fathul Mu\'in بشرح فتح المعين',
            authorOrRef: 'Syekh Zainuddin Al-Malibari (Wafat 987 H)',
            detailLocation: 'Bab An-Nikah (Fasl fil Shadaq), Halaman 108'
          },
          ibarahNote: 'IBARAH FIQIH: "Mahar milik penuh wanita begitu akad berlangsung. Suami atau wali tidak memiliki hak sedikit pun atas mahar tersebut kecuali dengan kerelaan hati wanita itu sendiri."'
        },
        {
          heading: '3. BAGAIMANA Hukum Jika Suami Menggunakan Sajadah / Alat Shalat Mahar Istri?',
          narrativeIntro: 'Ini adalah pertanyaan yang sering membingungkan pasangan pengantin baru: "Bolehkah suami ikut sholat memakai sajadah yang merupakan mahar pernikahan untuk istrinya?"',
          text: 'BAGAIMANA HUKUMNYA: Sajadah, mukenah, atau Al-Qur\'an yang dijadikan mahar adalah milik murni istri. Mengenai hukum suami menggunakannya:',
          bullets: [
            'JIKA DENGAN IZIN & RIDHA ISTRI: Hukumnya BOLEH dan SANGAT DIANJURKAN. Bahkan istri mendapatkan pahala ganda: pahala memberikan izin pemanfaatan barang dan pahala memfasilitasi ibadah suami.',
            'JIKA TANPA IZIN ATAU DENGAN PAKSAAN: Hukumnya HARAM (Ghasab), yaitu memakai barang milik orang lain tanpa izin pemiliknya yang sah.'
          ],
          examples: [
            'CONTOH KESEHARIAN: Suami hendak sholat di kamar, lalu mengambil sajadah mahar istri. Suami berkata: "Mba/Sayang, boleh aku pakai sajadahnya buat sholat?". Istri menjawab: "Boleh mas, pakai saja". Maka sholat suami sah dan mendapat keberkahan.',
            'TIPS PRAKTIS: Sebelum memakai barang-barang mahar istri (seperti sajadah atau membaca Al-Qur\'an mahar), biasakan meminta izin secara santun sebagai bentuk adab rumah tangga.'
          ],
          source: {
            type: 'Pendapat Ulama',
            title: 'Al-Majmu\' Syarh Al-Muhadzdzab',
            authorOrRef: 'Imam An-Nawawi (631-676 H)',
            detailLocation: 'Juz 16, Halaman 320, Kitab Al-Ghasab wal A\'riyah'
          }
        },
        {
          heading: '4. KAPAN Mahar Wajib Diberikan & Bagaimana Status Mahar Hutang (Kredit)?',
          narrativeIntro: 'Tidak semua pasangan memiliki kelapangan tunai saat hari pernikahan. Apakah boleh mahar ditangguhkan atau dihutang?',
          text: 'KAPAN DIBERIKAN: Mahar diwajibkan saat akad nikah. Berdasarkan kesepakatan, mahar boleh diserahkan secara tunai (Mahar Mu\'ajjal) atau ditangguhkan/dihutang (Mahar Mu\'ajjal).',
          bullets: [
            'STATUS MAHAR HUTANG: Nikah tetap SAH meskipun maharnya dihutang. Namun mahar tersebut menjadi UTANG SYAR\'I suami kepada istri yang wajib dilunasi kapan saja diminta oleh istri.',
            'HAK MENOLAK BERSATU (DUKHUL): Jika dipersyaratkan mahar tunai sebelum berhubungan intim namun suami belum membayar, istri BERHAK menolak diajak berhubungan intim sampai mahar tunai tersebut dilunasi.'
          ],
          examples: [
            'Suami mengucapkan qabul: "Saya terima nikahnya... dengan mahar emas 10 gram dibayar hutang." Nikah sah, dan emas 10g itu tercatat sebagai hutang wajib suami.',
            'Jika suami meninggal dunia sebelum melunasi mahar hutang, maka mahar tersebut Wajib dilunasi terlebih dahulu dari harta peninggalan (warisan) suami sebelum warisan dibagikan kepada ahli waris.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Al-Fiqh Al-Manhaji \'ala Madzhabil Imam Al-Syafi\'i',
            authorOrRef: 'Dr. Musthafa Al-Khin & Dr. Musthafa Al-Bugha',
            detailLocation: 'Juz 4, Halaman 75-80, Bab Ash-Shadaq'
          }
        },
        {
          heading: '5. BAGAIMANA Hukum Mahar Jika Terjadi Perceraian? (Qabla vs Ba\'da Dukhul)',
          narrativeIntro: 'Jika terjadi perpisahan di kemudian hari, bagaimana kepastian hukum mengenai harta mahar yang sudah diserahkan?',
          text: 'Hukum mengembalikan atau mempertahankan mahar saat terjadi perceraian sangat tegas dalam Fiqih Syafi\'iyyah:',
          bullets: [
            'CERAI SEBELUM BERHUBUNGAN INTIM (Qabla Dukhul): Suami berhak meminta kembali 50% dari mahar yang telah diberikan, dan istri wajib mengembalikan separuhnya.',
            'CERAI SETELAH BERHUBUNGAN INTIM (Ba\'da Dukhul): Mahar 100% menjadi HAK UTUH ISTRI. Suami HARAM meminta kembali mahar tersebut walaupun hanya 1 rupiah!',
            'CERAI KARENA KHULU\' (Gugat Cerai Tebusan): Istri mengembalikan mahar atau sejumlah harta sebagai tebusan atas kerelaan penceraiannya.'
          ],
          arabic: 'وَإِن طَلَّقْتُمُوهُنَّ مِن قَبْلِ أَن تَمَسُّوهُنَّ وَقَدْ فَرَضْتُمْ لَهُنَّ فَرِيضَةً فَنِصْفُ مَا فَرَضْتُمْ',
          latin: 'Wa in thallaqtumuhunna min qabli an tamassuhunna wa qad faradhtum lahunna faridhatan fa nishfu ma faradhtum.',
          translation: '"Jika kamu menceraikan istri-istrimu sebelum kamu menyentuh (menggauli) mereka, padahal kamu sudah menentukan maharnya, maka bayarlah seperdua dari mahar yang telah kamu tentukan itu..."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah Al-Baqarah Ayat 237',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 2, Surah Ke-2, Ayat 237'
          }
        }
      ],
      tips: [
        'Musyawarahkan mahar dengan jujur dan tidak memberatkan calon suami.',
        'Minta izin dengan santun kepada istri sebelum meminjam atau memakai barang maharnya.',
        'Pastikan nominal atau bentuk mahar dicatat dengan jelas dalam Buku Nikah.'
      ]
    }
  },
  {
    id: 'perceraian-talak',
    title: 'Perceraian, Hukum Talak, Gono-Gini, Hak Asuh, Masa Iddah & Rujuk',
    category: 'Masalah & Solusi',
    description: 'Panduan tuntas 5W1H: Hakikat talak, lafal Sharih/Kinayah, harta Gono-Gini, hak asuh anak (Hadhanah), syarat rujuk, detail masa Iddah, & larangan pasca cerai.',
    icon: AlertTriangle,
    bgGradient: 'bg-gradient-to-br from-slate-700 via-zinc-800 to-neutral-900',
    badge: 'Fiqih & Kehati-hatian',
    content: {
      summary: 'PERINGATAN SANGAT PENTING UNTUK PASANGAN: Pernikahan adalah ikatan suci yang sangat kokoh (Mitsaqan Ghalizha). Hukum talak membutuhkan kehati-hatian tertinggi karena ucapan suami memiliki konsekuensi hukum syariat yang seketika berlaku. Jika perceraian tidak terhindarkan, Islam mengatur secara adil harta gono-gini, hak asuh anak, tata cara rujuk, masa iddah, serta etika perpisahan.',
      sections: [
        {
          heading: '1. APA itu Talak & MENGAPA Menjadi Perbuatan Halal yang Paling Dibenci Allah?',
          narrativeIntro: 'Banyak pasangan muda belum menyadari betapa beratnya bobot ucapan kata "cerai" dalam syariat Islam.',
          text: 'APA DEFINISINYA: Talak secara bahasa berarti melepas ikatan. Secara syariat, talak adalah melepaskan ikatan pernikahan dengan lafal tertentu. MENGAPA DIBENCI: Karena perceraian merobohkan bangunan rumah tangga, memutus silaturahmi, dan menjadi kemenangan terbesar bagi setan. Perceraian hanya boleh menjadi pintu darurat terakhir.',
          arabic: 'أَبْغَضُ الْحَلاَلِ إِلَى اللَّهِ تَعَالَى الطَّلاَقُ',
          latin: 'Abghadul halali ilallahi ta\'ala at-thalaq.',
          translation: '"Perbuatan halal yang paling dibenci oleh Allah Ta\'ala adalah talak (perceraian)."',
          source: {
            type: 'Hadits Shahih',
            title: 'Sunan Abu Dawud & Sunan Ibn Majah',
            authorOrRef: 'Imam Abu Dawud Sulaiman bin Al-Asy\'ath',
            detailLocation: 'Kitab At-Thalaq, Bab fi Karahiyatit Thalaq, No. Hadits 2178'
          }
        },
        {
          heading: '2. BAGAIMANA Perbedaan Lafal Sharih (Tegas) & Kinayah (Sindiran)?',
          narrativeIntro: 'Syariat Islam membagi ucapan suami menjadi dua kategori hukum yang sangat berbeda:',
          bullets: [
            'LAFAL SHARIH (TEGAS): Menggunakan kata jelas seperti "Talak", "Cerai", atau "Lepas". Contoh: "Aku talak kamu!" atau "Kita cerai!". HUKUMNYA: JATUH TALAK SEKETIKA, baik diucapkan dalam keadaan sadar, emosi, bercanda, ataupun tanpa niat!',
            'LAFAL KINAYAH (SINDIRAN): Kata kiasan yang berpotensi mengandung arti cerai atau bukan. Contoh: "Pulang sana ke rumah orang tuamu!", "Pergi dari hidupku!". HUKUMNYA: JATUH TALAK HANYA JIKA DISERTAI NIAT TALAK DALAM HATI SUAMI SAAT MENGUCAPKANKANNYA.'
          ],
          examples: [
            'KASUS EMOSI KARENA BERTENGKAR: Suami berteriak emosi: "Kalo kamu gak manut, kita cerai aja!". Karena menggunakan kata "cerai" (sharih), maka TALAK 1 TELAH JATUH secara hukum Islam!',
            'KASUS SINDIRAN: Suami berkata: "Pergi kamu dari rumah ini!". Jika suami berniat menceraikan, maka jatuh talak. Namun jika suami hanya menyuruh istri menenangkan diri tanpa niat cerai, maka TIDAK JATUH TALAK.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Fathul Qarib Al-Mujib',
            authorOrRef: 'Syekh Muhammad bin Qasim Al-Ghazi',
            detailLocation: 'Halaman 46-48, Kitab At-Thalaq'
          }
        },
        {
          heading: '3. BAGAIMANA Hukum Harta Gono-Gini (Harta Bersama / Syirkah Syatrah)?',
          narrativeIntro: 'Saat perpisahan terjadi, kepemilikan aset yang diperoleh bersama selama masa pernikahan sering memicu perselisihan.',
          text: 'HUKUM HARTA GONO-GINI: Dalam Fiqih Islam dan Kompilasi Hukum Islam (KHI), Harta Gono-Gini adalah harta benda yang diperoleh atas usaha suami dan/atau istri selama terikat dalam hubungan pernikahan.',
          bullets: [
            'PEMBAGIAN 50:50: Harta yang dibeli atau dikumpulkan bersama selama pernikahan dibagi 2 sama rata (50% hak suami, 50% hak istri) setelah dikurangi hutang-hutang bersama.',
            'HARTA BAWAAN & WARISAN: Harta yang diperoleh sebelum menikah, harta warisan pribadi, atau hadiah murni untuk salah satu pihak TETAP dikiaskan sebagai Harta Pribadi yang tidak boleh diganggu gugat oleh mantan pasangan.'
          ],
          examples: [
            'Rumah yang dicicil dari gaji suami dan usaha istri selama menikah dibagi 50:50 saat cerai.',
            'Tanah warisan yang diterima suami dari almarhum ayahnya TETAP milik mutlak suami, istri tidak berhak menuntut bagian tanah warisan tersebut.'
          ],
          source: {
            type: 'Pendapat Ulama',
            title: 'Kompilasi Hukum Islam (KHI) Pasal 85-97 & Fiqih Muamalah Syirkah',
            authorOrRef: 'Kesepakatan Ulama & Mahkamah Agung RI',
            detailLocation: 'Bab XIII Harta Bersama Dalam Perkawinan'
          }
        },
        {
          heading: '4. SIAPA Berhak Atas Hak Asuh Anak (Hadhanah) & Urutan Prioritasnya?',
          narrativeIntro: 'Anak adalah korban paling rentan saat perceraian. Fiqih Islam memberikan perlindungan terbaik bagi anak.',
          text: 'SIAPA YANG PALING BERHAK: Untuk anak yang belum Mumayyiz (di bawah usia 7-12 tahun), HAK ASUH UTAMA BERADA DI TANGAN IBU KANDUNG.',
          bullets: [
            'URUTAN PRIORITAS HAK ASUH: (1) Ibu Kandung, (2) Nenek dari pihak Ibu, (3) Ayah Kandung, (4) Nenek dari pihak Ayah, (5) Saudara Perempuan Kandung.',
            'GUGURNYA HAK ASUH IBU: Hak asuh ibu gugur jika: Ibu murtad, fasik/berperilaku buruk yang membahayakan anak, menelantarkan anak, atau Ibu menikah lagi dengan laki-laki lain yang bukan mahram bagi anak tersebut.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Kifayatul Akhyar',
            authorOrRef: 'Imam Taqiyuddin Al-Hishni',
            detailLocation: 'Juz 2, Halaman 120-125, Bab Al-Hadhanah'
          }
        },
        {
          heading: '5. BAGAIMANA Rincian Masa Iddah Berdasarkan 4 Kondisi Wanita?',
          narrativeIntro: 'Masa Iddah adalah masa menunggu bagi wanita yang dicerai untuk memastikan kebersihan rahim dan memberikan kesempatan ruju\'.',
          bullets: [
            '1. WANITA HAMIL: Masa iddahnya berakhir sampai IA MELAHIRKAN KANDUNGANNYA (baik dicerai mati maupun dicerai hidup).',
            '2. WANITA MASIH HAID (Dicerai Hidup): Masa iddahnya adalah 3 KALI SUCI (3 Quru\') dari haid (sekitar 85-90 hari).',
            '3. WANITA MENOPAUSE / BELUM PERNAH HAID: Masa iddahnya adalah 3 BULAN HIJRIYAH.',
            '4. WANITA DICERAI SEBELUM BERHUBUNGAN INTIM (Qabla Dukhul): TIDAK ADA MASA IDDAH sama sekali. Wanita tersebut boleh langsung menikah lagi.'
          ],
          arabic: 'وَالْمُطَلَّقَاتُ يَتَرَبَّصْنَ بِأَنفُسِهِنَّ ثَلاَثَةَ قُرُوءٍ',
          latin: 'Wal-muthallaqatu yatarabbasna bi-anfusihinna thalathata quru\'.',
          translation: '"Wanita-wanita yang ditalak hendaklah menahan diri (menunggu) tiga kali quru\' (tiga kali suci)..."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah Al-Baqarah Ayat 228',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 2, Surah Ke-2, Ayat 228'
          }
        },
        {
          heading: '6. BAGAIMANA Syarat Sah Rujuk & Larangan Pasca Bercerai?',
          narrativeIntro: 'Islam memberikan kemudahan bagi pasangan yang ingin memperbaiki kembali ikatan pernikahannya.',
          bullets: [
            'SYARAT RUJUK SAH: (1) Terjadi pada Talak 1 atau Talak 2 (Talak Raj\'i), (2) Masih berada dalam MASA IDDAH, (3) Diucapkan oleh suami yang berakal dan tanpa paksaan. Rujuk CUKUP diucapkan oleh suami: "Aku ruju\' padamu" TANPA perlu akad nikah baru, tanpa wali baru, dan tanpa mahar baru.',
            'LARANGAN SELAMA IDDAH TALAK RAJ\'I: Suami istri DILARANG berkhalwat (berduaan di tempat sepi) jika tidak ada niat untuk rujuk. Namun mantan istri tetap berhak tinggal di rumah suami dan suami Wajib memberikan nafkah iddah.',
            'LARANGAN SETELAH IDDAH HABIS (TALAK BA\'IN): Jika masa iddah habis atau talak 3, mantan suami istri HARAM berhubungan intim dan menjadi AJNABI (orang asing). Jika ingin kembali pada talak 1/2 yang habis iddah, Wajib Akad Nikah Baru, Wali Baru, & Mahar Baru.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Fathul Mu\'in',
            authorOrRef: 'Syekh Zainuddin Al-Malibari',
            detailLocation: 'Bab Ar-Raj\'ah, Halaman 115-118'
          }
        }
      ],
      tips: [
        'Hapus ucapan kata "cerai" dan "talak" saat emosi bertengkar.',
        'Selesaikan urusan harta gono-gini dan nafkah anak secara bermartabat lewat kesepakatan tertulis atau KUA/Pengadilan Agama.',
        'Konsultasikan status talak dan rujuk kepada KUA/Ulama setempat.'
      ]
    }
  },
  {
    id: 'rukun-nikah',
    title: 'Rukun & Syarat Sah Nikah (Fiqih Munakahat)',
    category: 'Fiqih Nikah',
    description: 'Panduan tuntas 5W1H: 5 Rukun nikah, siapa urutan wali nasab, kriteria saksi adil, shighat ijab qabul, & bahaya nikah siri.',
    icon: ShieldCheck,
    bgGradient: 'bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-700',
    badge: 'Fiqih Nikah',
    content: {
      summary: 'Pernikahan adalah akad yang menghalalkan hubungan antara laki-laki dan perempuan. Agar akad nikah sah secara hukum syariat Islam, 5 rukun nikah wajib terpenuhi tanpa ada satu pun yang terlewat.',
      sections: [
        {
          heading: '1. APA Saja 5 Rukun Nikah Menurut Mazhab Syafi\'i?',
          bullets: [
            '1. CALON SUAMI: Laki-laki, muslim, baligh, berakal, jelas identitasnya, dan tidak dalam ihram haji/umrah.',
            '2. CALON ISTRI: Perempuan, muslimah/ahli kitab, bebas dari halangan syar\'i (bukan mahram, tidak dalam masa iddah orang lain).',
            '3. WALI NIKAH: Wali nasab laki-laki dari pihak pengantin wanita yang memenuhi syarat syariat.',
            '4. DUA SAKSI ADIL: Dua orang laki-laki muslim, baligh, berakal, merdeka, mendengarkan akad, dan adil.',
            '5. SHIGHAT AKAD: Ijab (ucapan penyerahan dari wali) dan Qabul (ucapan penerimaan dari calon suami).'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Safinatun Najah & Fathul Mu\'in',
            authorOrRef: 'Syekh Salim bin Sumair Al-Hadhrami / Syekh Zainuddin Al-Malibari',
            detailLocation: 'Halaman 45 (Safinatun Najah) / Halaman 102 (Fathul Mu\'in)'
          }
        },
        {
          heading: '2. SIAPA Urutan Wali Nasab Yang Berhak Menikahkan?',
          text: 'SIAPA WALI SAH: Pernikahan tanpa izin wali nasab yang sah adalah BATAL demi hukum Islam. Urutan wali nasab dari yang paling berhak:',
          bullets: [
            '1. Ayah Kandung',
            '2. Kakek (Ayah dari Ayah kandung) dan ke atas',
            '3. Saudara Laki-Laki Sekandung (Kakak/Adik laki-laki se-Ayah se-Ibu)',
            '4. Saudara Laki-Laki Se-Ayah',
            '5. Paman (Saudara laki-laki Ayah kandung)',
            '6. Wali Hakim (Penghulu resmi KUA) jika tidak ada wali nasab / wali adhal (enggan tanpa alasan syar\'i).'
          ],
          examples: [
            'KASUS NIKAH TANPA AYAH: Jika Ayah kandung masih hidup dan sehat, maka Paman atau Kakak TIDAK BOLEH menjadi wali nikah kecuali jika Ayah kandung mewakilkan (Tawkil Wali) secara resmi.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Kifayatul Akhyar',
            authorOrRef: 'Imam Taqiyuddin Al-Hishni',
            detailLocation: 'Halaman 350-355, Bab Al-Auliya\' fit Nikah'
          }
        },
        {
          heading: '3. BAGAIMANA Kriteria Saksi Adil & Lafal Ijab Qabul yang Sah?',
          text: 'Shighat wajib diucapkan bersambung (muwalat) tanpa ada jeda lama atau ucapan pemisah yang merusak makna.',
          bullets: [
            'KRITERIA SAKSI ADIL: Dua orang laki-laki muslim, baligh, berakal, mendengarkan ucapan ijab qabul secara jelas, dan tidak sering melakukan dosa besar.',
            'LAFAL IJAB (Dari Wali): "Saya nikahkan dan saya kawinkan engkau dengan anak saya (Nama Istri) dengan mahar (Bentuk Mahar) dibayar tunai."',
            'LAFAL QABUL (Dari Suami): "Saya terima nikahnya dan kawinnya (Nama Istri) dengan mahar tersebut dibayar tunai."'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Fathul Qarib Al-Mujib',
            authorOrRef: 'Syekh Muhammad bin Qasim Al-Ghazi',
            detailLocation: 'Halaman 44, Kitab An-Nikah'
          }
        },
        {
          heading: '4. BAGAIMANA Hukum Nikah Siri Menurut Fiqih vs Hukum Negara?',
          narrativeIntro: 'Nikah siri adalah pernikahan yang memenuhi rukun Fiqih namun tidak dicatatkan di Kantor Urusan Agama (KUA).',
          bullets: [
            'SECARA SYARIAT FIQIH: Nikah siri SAH apabila 5 rukun nikah terpenuhi (ada wali sah, 2 saksi adil, ijab qabul, mahar, dan pasangan).',
            'RISIKO & BAHAYA HUKUM NEGARA: Nikah siri TIDAK MEMILIKI KEKUATAN HUKUM. Sangat merugikan hak perdata istri dan anak. Anak sulit mendapatkan Akta Kelahiran resmi nama ayah, istri tidak berhak atas nafkah hukum dan warisan resmi negara jika ditelantarkan.'
          ],
          source: {
            type: 'Pendapat Ulama',
            title: 'Fatwa MUI & Kompilasi Hukum Islam (KHI)',
            authorOrRef: 'Majelis Ulama Indonesia',
            detailLocation: 'Fatwa MUI tentang Pencatatan Perkawinan'
          }
        }
      ],
      tips: [
        'Pastikan dokumen pernikahan terdaftar resmi di KUA negara untuk jaminan hukum anak & istri.',
        'Lakukan gladi bersih pengucapan ijab qabul agar tidak gugup saat akad.'
      ]
    }
  },
  {
    id: 'hak-kewajiban-suami',
    title: 'Hak & Kewajiban Suami (Kepemimpinan Qawwamah)',
    category: 'Fiqih Nikah',
    description: 'Panduan tuntas 5W1H: Peran pemimpin bijak, penyedia nafkah lahir batin, pelindung dari KDRT, & pembimbing agama.',
    icon: Scale,
    bgGradient: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800',
    badge: 'Kepemimpinan Suami',
    content: {
      summary: 'Kepemimpinan suami (Qawwamah) bukanlah kekuasaan sewenang-wenang atau otoriter, melainkan tanggung jawab pelayanan, perlindungan, pembimbingan syariat, dan penyediaan nafkah bagi keluarga.',
      sections: [
        {
          heading: '1. APA Maksud Suami Sebagai Qawwam (Pemimpin)?',
          text: 'Kedudukan kepemimpinan suami didasarkan atas tanggung jawab menanggung beban ekonomi dan perlindungan keluarga.',
          arabic: 'الرِّجَالُ قَوَّامُونَ عَلَى النِّسَاءِ بِمَا فَضَّلَ اللَّهُ بَعْضَهُمْ عَلَى بَعْضٍ وَبِمَا أَنْفَقُوا مِنْ أَمْوَالِهِمْ',
          latin: 'Ar-rijalu qawwamuna \'alan-nisa\'i bima faddhalallahu ba\'dhahum \'ala ba\'dhin wa bima anfaqu min amwalihim.',
          translation: '"Laki-laki (suami) itu pelindung/pemimpin bagi perempuan (istri), karena Allah telah melebihkan sebagian mereka atas sebagian yang lain dan karena mereka telah menafkahkan sebagian dari harta mereka..."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah An-Nisa Ayat 34',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 5, Surah Ke-4, Ayat 34'
          }
        },
        {
          heading: '2. APA Saja Kewajiban Utama Suami Terhadap Istri?',
          bullets: [
            '1. NAFKAH LAHIR: Menyediakan pangan (makanan pokok), sandang (pakaian layak), dan papan (tempat tinggal yang aman dan privasi).',
            '2. NAFKAH BATIN: Memberikan kehangatan biologis, perlakuan romantis, rasa aman, dan kasih sayang.',
            '3. PEMBIMBING AGAMA: Mengajarkan sholat, Al-Qur\'an, menutup aurat, atau memfasilitasi istri belajar ilmu agama.',
            '4. PELINDUNG DARI KDRT: Dilarang keras memukul wajah, menghina fisik, atau melakukan kekerasan verbal/emosional.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Al-Umm & Fathul Mu\'in',
            authorOrRef: 'Imam Asy-Syafi\'i / Syekh Zainuddin Al-Malibari',
            detailLocation: 'Bab Nafaqatul Zaujah'
          }
        }
      ]
    }
  },
  {
    id: 'hak-kewajiban-istri',
    title: 'Hak & Kewajiban Istri Dalam Islam',
    category: 'Fiqih Nikah',
    description: 'Panduan tuntas 5W1H: Ketaatan dalam kebaikan, menjaga kehormatan diri & harta suami, serta pelayanan kasih sayang.',
    icon: Heart,
    bgGradient: 'bg-gradient-to-br from-pink-600 via-rose-600 to-red-600',
    badge: 'Hak & Kewajiban',
    content: {
      summary: 'Islam memuliakan wanita dengan menetapkan hak-hak istimewa yang wajib dipenuhi oleh suami, serta memberikan panduan kewajiban istri untuk menjaga ketenteraman rumah tangga.',
      sections: [
        {
          heading: '1. APA Saja Kewajiban Utama Istri Terhadap Suami?',
          bullets: [
            '1. KETAATAN DALAM KEBAIKAN: Menatai perintah suami selama tidak menyuruh maksiat kepada Allah SWT.',
            '2. MENJAGA KEHORMATAN & HARTA SUAMI: Menjaga kesucian diri dan tidak memasukkan orang asing ke rumah tanpa izin suami.',
            '3. MENGURUS RUMAH TANGGA & PELAYANAN: Mengelola suasana rumah agar menentramkan (sakinah).',
            '4. MENJAGA RAHASIA DUSUN/RANJANG: Dilarang menceritakan aib suami atau rahasia tempat tidur kepada teman atau media sosial.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: '\'Uqudul Lujain',
            authorOrRef: 'Syekh Nawawi Al-Bantani',
            detailLocation: 'Halaman 10-15'
          }
        },
        {
          heading: '2. BAGAIMANA Batas Ketaatan Istri?',
          text: 'Prinsip ketaatan istri adalah "Tha\'at fi ma\'ruf" (taat dalam hal kebaikan). Tidak ada ketaatan kepada makhluk dalam kemaksiatan kepada Sang Pencipta.',
          examples: [
            'Jika suami melarang istri sholat 5 waktu atau menyuruh melepas jilbab, istri Wajib menolak dengan cara santun.'
          ],
          source: {
            type: 'Hadits Shahih',
            title: 'Shahih Al-Bukhari & Muslim',
            authorOrRef: 'Imam Al-Bukhari',
            detailLocation: 'Kitab Ahkam'
          }
        }
      ]
    }
  },
  {
    id: 'adab-intim',
    title: 'Adab Hubungan Intim (Jima\') & Fiqih Mandi Junub',
    category: 'Doa & Adab',
    description: 'Panduan tuntas 5W1H: Doa sebelum/sesudah jima\', waktu sunnah & makruh, larangan haram (haid/dubur), & tata cara mandi junub.',
    icon: Flame,
    bgGradient: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-rose-700',
    badge: 'Bersetubuh Sunnah',
    content: {
      summary: 'Hubungan intim (Jima\') antara suami istri yang sah bernilai ibadah dan sedekah apabila diawali dengan niat suci, doa, serta adab kelembutan.',
      sections: [
        {
          heading: '1. APA Doa Sebelum Berhubungan Intim & MENGAPA Wajib Dibaca?',
          text: 'MENGAPA DIBACA: Membaca doa sebelum bersetubuh melindung pasangan dan calon anak yang ditakdirkan lahir dari gangguan setan.',
          arabic: 'بِسْمِ اللهِ، اَللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا',
          latin: 'Bismillah, Allahumma jannibnas-syaithana wa jannibis-syaithana ma razaqtana.',
          translation: '"Dengan nama Allah, ya Allah jauhkanlah kami dari setan dan jauhkanlah setan dari apa yang Engkau rezekikan kepada kami."',
          source: {
            type: 'Hadits Shahih',
            title: 'Shahih Al-Bukhari',
            authorOrRef: 'Imam Al-Bukhari',
            detailLocation: 'Kitab Al-Wudhu, No. Hadits 141'
          }
        },
        {
          heading: '2. KAPAN Hubungan Intim DILARANG KERAS (Haram Hukumnya)?',
          bullets: [
            '1. SAAT ISTRI SEDANG HAID / NIFAS: Haram melakukan penetrasi sampai darah berhenti dan istri mandi wajib.',
            '2. DARI JALUR BELAKANG (DUBUR/ANUS): Haram hukumnya (termasuk dosa besar) bersetubuh melalui dubur.',
            '3. SAAT BERPUASA WAJIB RAMADHAN: Bersetubuh di siang hari bulan Ramadhan membatalkan puasa dan dikenakan denda Kaffarat berat.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Fathul Qarib Al-Mujib',
            authorOrRef: 'Syekh Muhammad bin Qasim Al-Ghazi',
            detailLocation: 'Bab Al-Haidh, Halaman 12'
          }
        },
        {
          heading: '3. BAGAIMANA Tata Cara Mandi Junub (Ghusl) Yang Sempurna?',
          bullets: [
            '1. Niat Mandi Wajib dalam hati saat air pertama menyentuh tubuh.',
            '2. Mencuci kedua tangan dan membersihkan kemaluan dari sisa kotoran.',
            '3. Berwudhu secara sempurna seperti wudhu sholat.',
            '4. Menyiramkan air ke atas kepala sebanyak 3 kali hingga membasahi pangkal rambut.',
            '5. Menyiram seluruh anggota tubuh (sebelah kanan lalu kiri) hingga lipatan-lipatan kulit.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Safinatun Najah',
            authorOrRef: 'Syekh Salim bin Sumair Al-Hadhrami',
            detailLocation: 'Fasl fi Furudhil Ghusli'
          }
        }
      ]
    }
  },
  {
    id: 'tarbiyatul-aulad',
    title: 'Mendidik Anak: Tahapan Tarbiyatul Aulad & Aqiqah',
    category: 'Parenting',
    description: 'Panduan mendidik anak dalam Islam berdasarkan 3 tahapan usia (0-7, 7-14, & 14-21 tahun), tata cara Aqiqah, & nama baik.',
    icon: Baby,
    bgGradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700',
    badge: 'Parenting Islami',
    content: {
      summary: 'Pendidikan anak (Tarbiyatul Aulad) dalam pencerahan Khalifah Ali bin Abi Thalib RA dan arahan para ulama terbagi menjadi 3 fase usia strategis sesuai perkembangan emosi dan kecerdasan anak.',
      sections: [
        {
          heading: '1. Usia 0 - 7 Tahun: Layani Seperti "Raja" (Bermain & Kasih Sayang)',
          text: 'Pada usia emas ini, anak membutuhkan rasa aman, kasih sayang penuh, dan pelukan hangat. Anak belajar dengan meniru (imitation). Hindari memukul atau membentak anak.',
          examples: [
            'Mencium kening anak setiap bangun tidur dan sebelum tidur.',
            'Memberikan contoh sholat dan berdoa secara kasat mata di depan anak.'
          ],
          source: {
            type: 'Pendapat Ulama',
            title: 'Tuhfatul Maudud bi Ahkamil Maulud',
            authorOrRef: 'Imam Ibnul Qayyim Al-Jauziyyah',
            detailLocation: 'Bab 14, Halaman 215'
          }
        },
        {
          heading: '2. Usia 7 - 14 Tahun: Disiplinkan Seperti "Prajurit" (Adab & Sholat)',
          arabic: 'مُرُوا أَوْلاَدَكُمْ بِالصَّلاَةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ، وَاضْرِبُوهُمْ عَلَيْهَا وَهُمْ أَبْنَاءُ عَشْرِ سِنِينَ',
          latin: 'Muru awladakum bis-shalate wa hum abna\'u sab\'i sinina, wadribuhum \'alaiha wa hum abna\'u \'ashri sinina.',
          translation: '"Perintahkan anak-anakmu melaksanakan shalat pada usia 7 tahun, dan berikan teguran tegas jika meninggalkannya pada usia 10 tahun..."',
          source: {
            type: 'Hadits Shahih',
            title: 'Sunan Abu Dawud',
            authorOrRef: 'Imam Abu Dawud',
            detailLocation: 'No. Hadits 495'
          }
        },
        {
          heading: '3. Usia 14 - 21 Tahun: Perlakukan Seperti "Sahabat" (Diskusi & Tanggung Jawab)',
          text: 'Anak remaja membutuhkan ruang diskusi, kepercayaan, dan penghargaan atas pendapat mereka.',
          source: {
            type: 'Kitab Kuning',
            title: 'Tarbiyatul Aulad fil Islam',
            authorOrRef: 'Dr. Abdullah Nashih \'Ulwan',
            detailLocation: 'Juz 1, Halaman 162'
          }
        },
        {
          heading: '4. Sunnah Aqiqah & Pemilihan Nama Yang Baik',
          bullets: [
            'AQIQAH: Sunnah muakkadah disembelih pada hari ke-7 kelahiran (2 ekor kambing untuk bayi laki-laki, 1 ekor untuk bayi perempuan).',
            'MENCUKUR RAMBUT & SEDEKAH: Mencukur rambut bayi hingga bersih lalu bersedekah perak/emas senilai berat timbangan rambut.',
            'PEMBERIAN NAMA BAIK: Memilih nama yang Mengandung doa (Asmaul Husna atau nama Nabi/Sahabat).'
          ],
          source: {
            type: 'Hadits Shahih',
            title: 'Sunan At-Tirmidzi',
            authorOrRef: 'Imam At-Tirmidzi',
            detailLocation: 'Kitab Al-Adhahi, Bab Al-Aqiqah'
          }
        }
      ]
    }
  },
  {
    id: 'dosa-suami-istri',
    title: 'Dosa Suami & Dosa Istri Dalam Rumah Tangga',
    category: 'Masalah & Solusi',
    description: 'Bentuk pelanggaran hak, perlakuan kasar/KDRT, penelantaran nafkah, nusyuz, serta ancaman dosa pelakunya.',
    icon: ShieldAlert,
    bgGradient: 'bg-gradient-to-br from-rose-600 via-red-700 to-pink-800',
    badge: 'Peringatan Syariat',
    content: {
      summary: 'Keberkahan rumah tangga dapat terangkat akibat dosa dan kezaliman salah satu pasangan terhadap hak-hak pasangannya.',
      sections: [
        {
          heading: '1. Dosa-Dosa Suami Terhadap Istri',
          bullets: [
            'Pelit dan melalaikan nafkah lahir (makanan, pakaian, tempat tinggal) padahal mampu.',
            'Berbuat kasar, membentak, atau melakukan kekerasan fisik/emosional (KDRT).',
            'Membiarkan istri dalam kebodohan agama tanpa diajarkan sholat dan menutup aurat.',
            'Menyebarkan rahasia tempat tidur atau kekurangan pribadi istri kepada orang lain/sosmed.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: '\'Uqudul Lujain',
            authorOrRef: 'Syekh Nawawi Al-Bantani',
            detailLocation: 'Halaman 3-8, Bab I'
          }
        },
        {
          heading: '2. Dosa-Dosa Istri Terhadap Suami',
          bullets: [
            'Nusyuz (membangkang/durhaka) terhadap perintah suami dalam kebaikan.',
            'Menolak ajakan berhubungan intim tanpa uzur syar\'i.',
            'Keluar rumah tanpa izin suami atau mengizinkan orang yang tidak disukai masuk.',
            'Mengkufuri kebaikan suami dan selalu merasa kurang atas pemberian nafkah.'
          ],
          source: {
            type: 'Hadits Shahih',
            title: 'Shahih Al-Bukhari',
            authorOrRef: 'Imam Al-Bukhari',
            detailLocation: 'No. Hadits 5193'
          }
        }
      ]
    }
  },
  {
    id: 'doa-rumah-tangga',
    title: 'Doa-Doa Suami Istri & Doa Keharmonisan Rumah Tangga',
    category: 'Doa & Adab',
    description: 'Kumpulan doa mustajab memohon keberkahan, meluluhkan amarah pasangan, keharmonisan, serta permohonan keturunan shalih.',
    icon: BookHeart,
    bgGradient: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700',
    badge: 'Doa Mustajab',
    content: {
      summary: 'Doa adalah benteng utama menjaga hati pasangan dari fitnah, kejenuhan, serta gangguan setan pemecah belah keluarga.',
      sections: [
        {
          heading: '1. Doa Pasangan & Keturunan Penyenang Hati (Qurrota A\'yun)',
          arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
          latin: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a\'yunin waj\'alna lil-muttaqina imama.',
          translation: '"Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah Al-Furqan Ayat 74',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 19, Surah Ke-25, Ayat 74'
          }
        },
        {
          heading: '2. Doa Pengantin Baru (Barakallahu Laka)',
          arabic: 'بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
          latin: 'Barakallahu laka wa baraka \'alaika wa jama\'a bainakuma fii khair.',
          translation: '"Semoga Allah memberkahimu di waktu lapang dan memberkahimu di waktu sempit, serta mengumpulkan kalian berdua dalam kebaikan."',
          source: {
            type: 'Hadits Shahih',
            title: 'Sunan At-Tirmidzi',
            authorOrRef: 'Imam At-Tirmidzi',
            detailLocation: 'No. Hadits 1091'
          }
        },
        {
          heading: '3. Doa Meluluhkan Amarah Pasangan & Pelembut Hati',
          arabic: 'اَللَّهُمَّ أَلِّفْ بَيْنَ قُلُوْبِنَا وَأَصْلِحْ ذَاتَ بَيْنِنَا وَاهْدِنَا سُبُلَ السَّلاَمِ',
          latin: 'Allahumma allif baina qulubina wa ashlih zhata bainina wahdina subulas-salam.',
          translation: '"Ya Allah, satukanlah hati kami, perbaikilah hubungan di antara kami, dan tunjukkanlah kami jalan-jalan keselamatan."',
          source: {
            type: 'Hadits Shahih',
            title: 'Sunan Abu Dawud',
            authorOrRef: 'Imam Abu Dawud',
            detailLocation: 'No. Hadits 969'
          }
        },
        {
          heading: '4. Doa Memohon Keturunan Shalih & Shalihah',
          arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
          latin: 'Rabbi hab lii min ladunka dhurriyyatan thayyibatan innaka samii\'ud-du\'aa\'.',
          translation: '"Ya Tuhanku, berilah aku dari sisi-Mu seorang anak yang baik. Sesungguhnya Engkau Maha Mendengar doa."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah Ali \'Imran Ayat 38',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 3, Surah Ke-3, Ayat 38'
          }
        }
      ]
    }
  },
  {
    id: 'tips-samawa',
    title: 'Tips Rumah Tangga Supaya Samawa (Panduan Pasutri)',
    category: 'Panduan Samawa',
    description: '7 Kunci praktis membangun rumah tangga Sakinah, Mawaddah, wa Rahmah serta cara menyelesaikan konflik.',
    icon: Sparkles,
    bgGradient: 'bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600',
    badge: 'Kunci Bahagia',
    content: {
      summary: 'Visi Samawa tidak terjadi secara kebetulan, melainkan hasil perjuangan riil, kesabaran, serta kepatuhan kepada syariat Islam.',
      sections: [
        {
          heading: '7 Pilar Utama Bangunan Samawa',
          bullets: [
            '1. Niatkan Pernikahan Sebagai Ibadah Terpanjang: Menjadikan keridhaan Allah sebagai tujuan utama.',
            '2. Komunikasi Terbuka & Lembut (Kalam Thayyib): Membicarakan masalah tanpa meninggikan nada suara.',
            '3. Saling Memaafkan & Memaklumi Kekurangan: Tidak menyimpan dendam atas kesalahan masa lalu.',
            '4. Menjaga Kualitas Waktu (Quality Time & Re-Dating): Melakukan aktivitas berdua secara konsisten.',
            '5. Qana\'ah & Bersyukur Atas Rezeki: Tidak membandingkan perekonomian rumah tangga dengan orang lain.'
          ],
          source: {
            type: 'Kitab Kuning',
            title: 'Ihya \'Ulumiddin',
            authorOrRef: 'Imam Al-Ghazali',
            detailLocation: 'Juz 2, Halaman 35'
          }
        },
        {
          heading: 'Tata Cara Menyelesaikan Konflik Pasutri',
          bullets: [
            'Bicarakan masalah di tempat privat dan saat emosi sudah dingin.',
            'Fokus pada solusi, bukan mencari siapa yang menang atau kalah.',
            'Jika perselisihan memuncak, libatkan Penengah Bijak (Hakam) dari keluarga suami dan keluarga istri.'
          ],
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah An-Nisa Ayat 35',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 5, Ayat 35'
          }
        }
      ]
    }
  },
  {
    id: 'poligami',
    title: 'Poligami Dalam Hukum Islam',
    category: 'Fiqih Nikah',
    description: 'Syarat ketat keadilan, kehati-hatian, serta pandangan ulama Fiqih Syafi\'iyyah.',
    icon: Users,
    bgGradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800',
    badge: 'Fiqih Munakahat',
    content: {
      summary: 'Poligami dalam Syariat Islam adalah pintu rukhsah dengan syarat keadilan yang sangat berat.',
      sections: [
        {
          heading: '1. Syarat Utama Keadilan Yang Sangat Ketat',
          text: 'Suami wajib mampu berlaku adil dalam hal nafkah lahir, pakaian, tempat tinggal, serta pembagian giliran malam.',
          arabic: 'فَإِنْ خِفْتُمْ أَلَّا تَعْدِلُوا فَوَاحِدَةً',
          latin: 'Fa in khiftum alla ta\'dilu fa wahidah.',
          translation: '"...Kemudian jika kamu takut tidak akan dapat berlaku adil, maka (kawinilah) seorang saja..."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah An-Nisa Ayat 3',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 4, Surah Ke-4, Ayat 3'
          }
        },
        {
          heading: '2. Pandangan Mazhab Syafi\'i & KHI',
          text: 'Ulama Mazhab Syafi\'i menegaskan bahwa mencukupkan diri dengan satu istri (Monogami) adalah yang lebih afdhal demi menjaga kedamaian dan menghindari kezaliman.',
          source: {
            type: 'Kitab Kuning',
            title: 'Al-Hawi Al-Kabir',
            authorOrRef: 'Imam Al-Mawardi',
            detailLocation: 'Juz 9, Halaman 12'
          }
        }
      ]
    }
  },
  {
    id: 'selingkuh-kehencuran',
    title: 'Selingkuh & Bahaya Kehancuran Keluarga',
    category: 'Masalah & Solusi',
    description: 'Dosa perselingkuhan, perzinahan, aplikasi dating, bahaya siber, serta langkah pemulihan.',
    icon: Flame,
    bgGradient: 'bg-gradient-to-br from-red-700 via-rose-800 to-zinc-900',
    badge: 'Bahaya Zina',
    content: {
      summary: 'Perselingkuhan adalah pengkhianatan terhadap perjanjian suci pernikahan yang merusak merusak kepercayaan dan mengundang murka Allah SWT.',
      sections: [
        {
          heading: '1. Larangan Mendekati Pintu-Pintu Zina',
          arabic: 'وَلاَ تَقْرَبُوا الزِّنَى إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلاً',
          latin: 'Wa la taqrabuz-zina innahu kana fahishatan wa sa\'a sabila.',
          translation: '"Dan janganlah kamu mendekati zina; sesungguhnya zina itu adalah suatu perbuatan yang keji dan suatu jalan yang buruk."',
          source: {
            type: 'Al-Qur\'an',
            title: 'Surah Al-Isra Ayat 32',
            authorOrRef: 'Firman Allah SWT',
            detailLocation: 'Juz 15, Surah Ke-17, Ayat 32'
          }
        },
        {
          heading: '2. Bahaya Perselingkuhan Siber & Aplikasi Chatting',
          text: 'Curhat rahasia dengan lawan jenis yang bukan mahram melalui aplikasi pesan atau media sosial adalah pintu masuk fitnah perselingkuhan.',
          source: {
            type: 'Pendapat Ulama',
            title: 'Tafsir Ibn Katsir',
            authorOrRef: 'Imam Ibn Katsir',
            detailLocation: 'Juz 5, Halaman 45'
          }
        }
      ]
    }
  },
  {
    id: 'adab-rumah-tangga',
    title: 'Adab Dalam Rumah Tangga & Kehidupan Sehari-hari',
    category: 'Doa & Adab',
    description: 'Adab menyambut pasangan, bergaul dengan santun, menjaga privasi keluarga, & toleransi kekurangan.',
    icon: Home,
    bgGradient: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700',
    badge: 'Etika Pasutri',
    content: {
      summary: 'Keindahan rumah tangga tercermin dari adab dan tutur kata sehari-hari antara suami dan istri.',
      sections: [
        {
          heading: '1. Adab Menyambut Pasangan Pulang Beraktivitas',
          text: 'Menyambut dengan wajah berseri-seri, senyuman hangat, bersalaman, pakaian rapi, serta menyajikan hidangan pembuka.',
          source: {
            type: 'Kitab Kuning',
            title: 'I\'anatu Ath-Thalibin',
            authorOrRef: 'Syekh Abu Bakar Dimyathi',
            detailLocation: 'Juz 3, Halaman 352'
          }
        }
      ]
    }
  },
  {
    id: 'kisah-rasulullah',
    title: 'Kisah Rumah Tangga Rasulullah SAW',
    category: 'Kisah Nabi',
    description: 'Potret keharmonisan, kelembutan, dan romantisme Nabi SAW bersama Khadijah RA & Aisyah RA.',
    icon: Crown,
    bgGradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600',
    badge: 'Kisah Teladan',
    content: {
      summary: 'Rumah tangga Nabi Muhammad SAW adalah puncak keteladanan tertinggi (Uswatun Hasanah). Beliau memperlakukan istri-istri beliau dengan penuh penghormatan dan kehangatan.',
      sections: [
        {
          heading: '1. Panggilan Sayang "Humaira" & Romantisme Minum Segelas Berdua',
          text: 'Rasulullah SAW memanggil Sayyidah Aisyah RA dengan sebutan "Humaira" (pipi kemerah-merahan) dan minum dari cangkir tepat di bekas bibir Aisyah.',
          arabic: 'عَنْ عَائِشَةَ قَالَتْ: كُنْتُ أَشْرَبُ وَأَنَا حَائِضٌ، ثُمَّ أُنَاوِلُهُ النَّبِيَّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ فَيَضَعُ فَاهُ عَلَى مَوْضِعِ فِيَّ فَيَشْرَبُ',
          latin: 'An Aisyah qalat: Kuntu ashrabu wa ana haidh, thumma unawiluhu an-Nabiyya SAW fayadha\'u fahu \'ala mawdhi\'i fiyya fayashrab.',
          translation: '"Dari Aisyah RA, ia berkata: Aku pernah minum saat sedang haid, kemudian aku berikan cangkir itu kepada Nabi SAW. Beliau lalu meletakkan mulutnya tepat pada bekas bibirku, lalu beliau minum..."',
          source: {
            type: 'Hadits Shahih',
            title: 'Shahih Muslim',
            authorOrRef: 'Imam Muslim',
            detailLocation: 'No. Hadits 300'
          }
        }
      ]
    }
  }
];

const CATEGORIES = ['Semua', 'Kisah Nabi', 'Parenting', 'Fiqih Nikah', 'Doa & Adab', 'Masalah & Solusi', 'Panduan Samawa'];

const MarriageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedTopic, setSelectedTopic] = useState<MarriageTopic | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Filter topics
  const filteredTopics = MARRIAGE_TOPICS.filter(topic => {
    const matchesCategory = selectedCategory === 'Semua' || topic.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      topic.title.toLowerCase().includes(q) || 
      topic.description.toLowerCase().includes(q) ||
      topic.badge.toLowerCase().includes(q) ||
      topic.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShare = (topic: MarriageTopic) => {
    const title = topic.title;
    const text = `${topic.title}\n${topic.description}\n\nDiakses via Santri AI App.`;

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, text);
        return;
      } catch (err) {
        console.warn("Android share failed:", err);
      }
    }

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${topic.title}\n${topic.description}`);
      alert('Tautan/Teks berhasil disalin!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* STICKY CLEAN HEADER */}
      <div className="bg-rose-600 dark:bg-rose-900 pt-5 pb-5 px-5 rounded-b-[2.5rem] shadow-xl sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (selectedTopic) {
                  setSelectedTopic(null);
                } else {
                  navigate(-1);
                }
              }} 
              className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white active:scale-90 transition-transform shadow-inner"
              title="Kembali"
            >
              <ArrowLeft size={20}/>
            </button>
            <div>
              <h1 className="text-xl font-black text-white leading-tight flex items-center gap-1.5">
                {selectedTopic ? 'Detail Rumah Tangga' : 'Suami Istri (Samawa)'}
              </h1>
            </div>
          </div>
          
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
      </div>

      {/* SEARCH BAR */}
      {!selectedTopic && (
        <div className="px-5 mt-4 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kitab, mahar, talak, gono-gini, hak asuh, iddah, rujuk..."
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs font-medium focus:outline-none pr-2"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* DETAIL RUMAH TANGGA VIEW */}
      {selectedTopic ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 mt-6 max-w-2xl mx-auto space-y-6"
        >
          {/* Hero Banner for Detail */}
          <div className={`${selectedTopic.bgGradient} p-6 rounded-3xl text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none">
              <selectedTopic.icon size={160} />
            </div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider rounded-full border border-white/30 text-white">
                  {selectedTopic.badge}
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleShare(selectedTopic)}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all"
                    title="Bagikan"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={() => openExternalLink(PLAYSTORE_LINK)}
                    className="p-2 bg-amber-500/30 backdrop-blur-md rounded-xl text-amber-200 hover:bg-amber-500/40 transition-all border border-amber-300/30"
                    title="Beri Rating di Play Store"
                  >
                    <Star size={16} className="fill-amber-300" />
                  </button>
                  <button 
                    onClick={() => setIsReportOpen(true)}
                    className="p-2 bg-rose-500/30 backdrop-blur-md rounded-xl text-rose-200 hover:bg-rose-500/40 transition-all border border-rose-300/30"
                    title="Laporkan Masalah / Koreksi ke Admin"
                  >
                    <Flag size={16} />
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-black leading-tight text-white">{selectedTopic.title}</h2>
              <p className="text-xs text-white/90 leading-relaxed font-medium">{selectedTopic.content.summary}</p>
            </div>
          </div>

          {/* Detailed Content Sections */}
          <div className="space-y-4">
            {selectedTopic.content.sections.map((sec, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {sec.heading}
                  </h3>
                </div>

                {sec.narrativeIntro && (
                  <p className="text-xs text-rose-950 dark:text-rose-200 font-medium bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100/60 dark:border-rose-900/30 italic leading-relaxed">
                    "{sec.narrativeIntro}"
                  </p>
                )}

                {sec.text && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.text}
                  </p>
                )}

                {/* Arabic, Latin, & Translation Box */}
                {sec.arabic && (
                  <div className="bg-rose-50/60 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 space-y-3 relative">
                    <button 
                      onClick={() => handleCopyText(`${sec.arabic}\n\n${sec.latin}\n\n${sec.translation}`, idx)}
                      className="absolute top-3 right-3 p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-all"
                      title="Salin Dalil"
                    >
                      {copiedIndex === idx ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>

                    <p className="font-arabic text-xl text-right text-slate-800 dark:text-rose-100 leading-loose pt-1 pr-6">
                      {sec.arabic}
                    </p>
                    {sec.latin && (
                      <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 italic">
                        {sec.latin}
                      </p>
                    )}
                    {sec.translation && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-rose-200/50 dark:border-rose-900/40 pt-2">
                        {sec.translation}
                      </p>
                    )}
                  </div>
                )}

                {/* Bullet Points */}
                {sec.bullets && (
                  <ul className="space-y-2 pt-1">
                    {sec.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* REAL-LIFE EXAMPLES CARD */}
                {sec.examples && sec.examples.length > 0 && (
                  <div className="mt-2.5 bg-amber-50/80 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-amber-600 dark:text-amber-400 shrink-0" /> Contoh Nyata Keseharian & Studi Kasus:
                    </h4>
                    <ul className="space-y-1.5">
                      {sec.examples.map((ex, exIdx) => (
                        <li key={exIdx} className="flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                          <span className="font-bold text-amber-600 shrink-0">•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* IBARAH & FIQIH EXPLANATION CARD */}
                {sec.ibarahNote && (
                  <div className="mt-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" /> Pencerahan Fiqih & Ibarah
                    </h4>
                    <p className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">
                      {sec.ibarahNote}
                    </p>
                  </div>
                )}

                {/* AUTHENTIC SOURCE & REFERENCE CITATION CARD */}
                {sec.source && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-md border border-amber-200/60 dark:border-amber-800/50 uppercase tracking-wide flex items-center gap-1">
                        <BookMarked size={12} /> {sec.source.type}
                      </span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {sec.source.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      <strong>Pengarang / Perawi / Ulama:</strong> {sec.source.authorOrRef}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      📍 {sec.source.detailLocation}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Tips / Practical Advice */}
            {selectedTopic.content.tips && (
              <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" /> Tips & Langkah Kehati-hatian Praktis
                </h4>
                <ul className="space-y-2">
                  {selectedTopic.content.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <span className="font-bold text-amber-600 shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => setSelectedTopic(null)}
              className="w-full py-3.5 bg-slate-900 dark:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Kembali Ke Daftar Topik Rumah Tangga
            </button>
          </div>
        </motion.div>
      ) : (
        /* MAIN TOPIC LIST VIEW */
        <div className="px-5 mt-5 max-w-2xl mx-auto space-y-5">
          {/* FEATURED BANNER: KUMPULAN KITAB & HADITS SEPUTAR RUMAH TANGGA */}
          {(!searchQuery && selectedCategory === 'Semua') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                const kitabTopic = MARRIAGE_TOPICS.find(t => t.id === 'kumpulan-kitab-hadits');
                if (kitabTopic) setSelectedTopic(kitabTopic);
              }}
              className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-5 rounded-3xl text-white shadow-xl cursor-pointer relative overflow-hidden group active:scale-[0.98] transition-all border border-white/20"
            >
              <div className="absolute right-[-15px] bottom-[-15px] opacity-20 group-hover:scale-110 transition-transform pointer-events-none">
                <BookOpen size={140} />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider rounded-full border border-white/30 text-emerald-100 flex items-center gap-1">
                    <BookMarked size={12} /> Referensi Utama Santri & Ulama
                  </span>
                </div>
                <h2 className="text-lg font-black text-white leading-snug drop-shadow-sm">
                  Kumpulan Kitab Kuning & Hadits Shahih Seputar Rumah Tangga
                </h2>
                <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                  Rujukan kitab klasik (Qurrotul Uyun, 'Uqudul Lujain, Dhaw-ul Mishbah, Ihya 'Ulumiddin) & Sanad Hadits Shahih seputar pernikahan.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                  <span>Buka Perpustakaan Kitab & Hadits</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-105' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* TOPICS BANNERS GRID / LIST */}
          <div className="space-y-3.5">
            {filteredTopics.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center space-y-3 border border-slate-100 dark:border-slate-800">
                <HelpCircle size={40} className="mx-auto text-rose-400 opacity-60" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Topik tidak ditemukan</p>
                <p className="text-[11px] text-slate-400">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            ) : (
              filteredTopics.map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelectedTopic(topic)}
                    className={`${topic.bgGradient} p-5 rounded-3xl text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all group relative overflow-hidden border border-white/20`}
                  >
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-15 pointer-events-none group-hover:scale-110 transition-transform">
                      <Icon size={110} />
                    </div>

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner group-hover:scale-105 transition-transform shrink-0 border border-white/30">
                          <Icon size={22} />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-white bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30 uppercase tracking-wider">
                            {topic.badge}
                          </span>
                          <h3 className="font-bold text-white text-sm mt-1 leading-snug drop-shadow-sm">
                            {topic.title}
                          </h3>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Floating AI Assistant for Marriage Guidance */}
      <AiFeatureAssistant 
        featureName="Fiqih Rumah Tangga & Konsultasi Samawa" 
        placeholder="Tanyakan seputar mahar, talak, atau adab suami istri..."
      />

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName={`Rumah Tangga - ${selectedTopic?.title || 'Fiqih Nikah'}`}
        contentSnippet={selectedTopic ? `${selectedTopic.title} (${selectedTopic.category})\n\n${selectedTopic.description}\n\n${selectedTopic.content?.summary || ''}` : ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default MarriageScreen;
