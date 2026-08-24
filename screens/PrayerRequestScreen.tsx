import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  Send, 
  Info, 
  AlertCircle,
  Users,
  Coins,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  BookOpen,
  HelpingHand,
  Gem
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createPrayerRequest } from '../services/firebase';
import { useToast } from '../contexts/ToastContext';
import { generateJson } from '../services/geminiService';
import { UserAvatar } from '../components/UserAvatar';

const HAJAT_CATEGORIES = [
  {
    id: 'meninggal',
    title: 'Meninggal',
    emoji: '🕊️',
    color: 'from-slate-500/10 to-slate-600/5 hover:border-slate-300 dark:hover:border-slate-900',
    iconColor: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/40',
    titleFull: 'Kirim Doa Arwah (Ta\'ziyah / Meninggal)',
    hadith: '“Tidaklah seorang mayat dalam kubur melainkan dia seperti orang tenggelam yang meminta pertolongan, dia menunggu doa dari bapaknya, saudaranya, atau temannya.” (HR. Al-Baihaqi)',
    arab: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
    latin: 'Allahummaghfir lahu warhamhu wa \'aafihi wa\'fu \'anhu',
    arti: 'Ya Allah, ampunilah dia, sayangilah dia, sejahterakanlah dia, dan maafkanlah kesalahannya.',
    adab: 'Ikut mensholatkan, mendoakan dengan ikhlas di waktu ijabah, dan menghibur keluarga yang ditinggalkan.',
    defaultDraft: 'Bismillah, mohon keikhlasan doa fatihah dari para santri sekalian untuk almarhum/almarhumah [NAMA] yang telah berpulang ke Rahmatullah. Semoga diampuni khilafnya, dilapangkan kuburnya, dan berkumpul di jannah-Nya. Amin.'
  },
  {
    id: 'tahlil_haul',
    title: 'Tahlil/Haul',
    emoji: '📿',
    color: 'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-300 dark:hover:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40',
    titleFull: 'Peringatan Tahlil & Haul Arwah',
    hadith: '“Membaca surat Yasin di sisi mayit khusyuk berkah akan meringankan siksanya.” (Tafsir Ibnu Katsir)',
    arab: 'اللهُمَّ اغْفِرْ لِأَحْيَائِنَا وَأَمْوَاتِنَا وَأَشْهَادِنَا وَغَائِبِنَا',
    latin: 'Allahummaghfir li-ahyaainaa wa amwaatinaa wa asyhaadinaa wa ghaa-ibinaa',
    arti: 'Ya Allah, ampunilah orang-orang yang hidup di antara kami, yang telah wafat, yang hadir di majelis ini maupun yang ghaib.',
    adab: 'Bertawassul, membaca ayat suci Al-Qur\'an dengan tertib, dan menyambung tali silaturahmi dengan kerabat.',
    defaultDraft: 'Assalamualaikum Wr. Wb. Kami sekeluarga memohon barokah doa dan fatihah para kiai serta santri untuk tahlil/haul mengenang almarhum/almarhumah [NAMA]. Semoga pahala dzikir mengalir deras sebagai pembuka pintu surga.'
  },
  {
    id: 'kelahiran',
    title: 'Kelahiran',
    emoji: '👶',
    color: 'from-blue-500/10 to-blue-600/5 hover:border-blue-300 dark:hover:border-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40',
    titleFull: 'Syukuran Kelahiran Anak (Tasmiyah)',
    hadith: '“Setiap bayi digadaikan dengan aqiqahnya, disembelihkan untuknya pada hari ketujuh, dicukur rambutnya, dan diberi nama.” (HR. Abu Dawud)',
    arab: 'بَارَكَ اللهُ لَكَ فِي Mَوْهُوبِ لَكَ، وَشَكَرْتَ الوَاهِبَ',
    latin: 'Bârakallâhu laka fil mawhûbi laka, wa syakartal-wâhiba',
    arti: 'Semoga Allah memberkahimu dalam anak yang dianugerahkan kepadamu, semoga kamu bersyukur kepada Sang Pemberi.',
    adab: 'Mengumandangkan adzan di telinga kanan bayi, memberi nama yang bermakna baik, dan melakukan sunah aqiqah.',
    defaultDraft: 'Bismillah, telah lahir dengan sehat dan selamat putra/putri kami tercinta: [NAMA BAYI] anak dari pasangan [NAMA ORANGTUA]. Mohon ridha doanya agar menjadi anak yang sholeh/sholehah, berbakti, berakal cerdas, dan berkah ilmunya.'
  },
  {
    id: 'khitanan',
    title: 'Khitanan',
    emoji: '👦',
    color: 'from-amber-500/10 to-amber-600/5 hover:border-amber-300 dark:hover:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40',
    titleFull: 'Syukuran Khitanan Anak',
    hadith: '“Fitrah itu ada lima: khitan, mencukur bulu kemaluan, mencabut bulu ketiak, memotong kuku, dan memotong kumis.” (HR. Bukhari)',
    arab: 'اللَّهُمَّ طَهِّرْ جَسَدَهُ وَأَصْلِحْ بَاطِنَهُ وَظَاهِرَهُ',
    latin: 'Allahumma thahhir jasadahu wa ashlih baatinahu wa dhaahirahu',
    arti: 'Ya Allah, sucikanlah tubuhnya dan perbaikilah batin serta lahiriahnya.',
    adab: 'Menjaga kebersihan fisik pasca-khitan, mengajarkan adab bersuci, dan bersyukur atas terlaksananya syariat fitrah.',
    defaultDraft: 'Assalamualaikum rekan santri, putra kami [NAMA] akan melangsungkan khitanan. Mohon barokah fatihah dan doa restunya agar khitan berjalan lancar, cepat sembuh, serta tumbuh menjadi pemuda sholeh yang teguh iman.'
  },
  {
    id: 'dapat_jodoh',
    title: 'Dapat Jodoh',
    emoji: '💝',
    color: 'from-rose-500/10 to-rose-600/5 hover:border-rose-300 dark:hover:border-rose-900',
    iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40',
    titleFull: 'Mendapat Jodoh / Pasangan Sholeh',
    hadith: '“Pilihlah yang beragama, niscaya kamu akan beruntung dan bahagia.” (HR. Bukhari)',
    arab: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنْتَ خَيْرُ الْوَارِثِينَ',
    latin: 'Rabbi laa tadzarnii fardan wa Anta khairul waaritsiin',
    arti: 'Ya Tuhanku, janganlah Engkau biarkan aku hidup seorang diri dan Engkaulah sebaik-baik waris.',
    adab: 'Memperbaiki kualitas ibadah mandiri, memperbanyak shalat tahajud, dan menjaga kesucian diri dari maksiat.',
    defaultDraft: 'Bismillah, kami sedang berikhtiar mencari pasangan hidup yang sejati, sholeh/sholehah, dan berakhlak mulia secara agama. Mohon doa keikhlasan santri agar dimudahkan Allah dipertemukan dengan jodoh yang diridhai.'
  },
  {
    id: 'pernikahan',
    title: 'Pernikahan',
    emoji: '💍',
    color: 'from-purple-500/10 to-purple-600/5 hover:border-purple-300 dark:hover:border-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/40',
    titleFull: 'Pernikahan & Keluarga Sakinah',
    hadith: '“Bila seorang hamba menikah, maka sungguh ia telah menyempurnakan setengah agamanya...” (HR. Baihaqi)',
    arab: 'بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    latin: 'Bârakallâhu laka wa bâraka ‘alaika wa jama‘a bainakumâ fî khair',
    arti: 'Semoga Allah memberikan keberkahan kepadamu dan melimpahkan keberkahan atasmu, serta menyatukan kalian berdua dalam kebaikan.',
    adab: 'Saling bersabar atas ujian rumah tangga, mendirikan ibadah berjamaah, dan menjaga hak serta kewajiban masing-masing.',
    defaultDraft: 'Assalamualaikum santri nusantara. Insyaallah kami akan melaksanakan akad nikah pernikahan suci. Mohon doanya agar biduk keluarga kami menjadi sakinah, mawaddah, warahmah penuh ketenteraman dunia akhirat.'
  },
  {
    id: 'rumah_baru',
    title: 'Rumah Baru',
    emoji: '🏡',
    color: 'from-indigo-500/10 to-indigo-600/5 hover:border-indigo-300 dark:hover:border-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/40',
    titleFull: 'Syukuran Menempati Kediaman Baru',
    hadith: '“Rumah yang senantiasa dibacakan Surah Al-Baqarah di dalamnya tidak akan dimasuki oleh setan.” (HR. Muslim)',
    arab: 'رَبِّ أَنْزِلْنِي مُنْزَلًا مُبَارَكًا وَأَنْتَ خَيْرُ الْمُنْزِلِينَ',
    latin: 'Rabbi anzilnii munzalan mubaarakan wa Anta khairul munziliin',
    arti: 'Ya Tuhanku, tempatkanlah aku pada tempat yang diberkahi, dan Engkau adalah sebaik-baik pemberi tempat.',
    adab: 'Mengucapkan salam saat masuk rumah, membacakan dzikir/shalawat di sudut rumah, dan mengadakan doa bersama tetangga.',
    defaultDraft: 'Alhamdulillah, kami baru saja menempati kediaman rumah baru kami di [LOKASI]. Mohon lantunan doa kiai & santri agar rumah baru ini dipenuhi barokah kedamaian ibadah dan perlindungan dari marabahaya.'
  },
  {
    id: 'lunas_hutang',
    title: 'Lunas Hutang',
    emoji: '🪙',
    color: 'from-sky-500/10 to-sky-600/5 hover:border-sky-300 dark:hover:border-sky-900',
    iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/40',
    titleFull: 'Ikhtiar Pembebasan dari Hutang & Riba',
    hadith: '“Ya Allah, aku berlindung kepada-mu dari sedih dan susah, lemah dan malas... lilitan hutang dan penindasan orang.” (HR. Bukhari)',
    arab: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    latin: 'Allahummak-finii bi-halaalika \'an haraamika wa aghninii bi-fadhlika \'amman siwaaka',
    arti: 'Ya Allah, cukupkanlah aku dengan barang halal-Mu sehingga terhindar dari yang haram, dan kayakanlah aku dengan karunia-Mu dari selain-Mu.',
    adab: 'Bertekad kuat dan sungguh-sungguh melunasi hutang, hidup hemat secara qana\'ah, serta memperbanyak membaca amalan istighfar.',
    defaultDraft: 'Bismillah, saat ini keluarga kami diuji kesulitan tanggungan hutang yang berat. Mohon keikhlasan doanya agar Allah limpahkan kelancaran rezeki tak terduga untuk melunasi amanah hutang ini secepatnya.'
  },
  {
    id: 'syukuran',
    title: 'Syukuran',
    emoji: '🍲',
    color: 'from-violet-500/10 to-violet-600/5 hover:border-violet-300 dark:hover:border-violet-905',
    iconColor: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/40',
    titleFull: 'Syukuran Walimah & Hajat Terkabul',
    hadith: '“Syukurilah segala nikmat Allah karena dengan bersyukur nikmat tersebut akan bertambah.” (QS. Ibrahim: 7)',
    arab: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ',
    latin: 'Rabbi awzi\'-nii an asykura ni\'-mataka-llatii an-\'amta \'alayya',
    arti: 'Ya Tuhanku, tunjukilah aku untuk mensyukuri nikmat-Mu yang telah Engkau berikan kepadaku.',
    adab: 'Rendah hati, menjamu fasil miskin dhuafa, dan tidak bermegah-megahan demi menjaga dari penyakit riya\'.',
    defaultDraft: 'Alhamdulillah atas tercapainya hajat kami, kami menyelenggarakan syukuran sederhana. Mohon limpahan doa para santri agar nikmat yang kami terima ini membawa berkah untuk ketaatan ibadah.'
  },
  {
    id: 'musibah',
    title: 'Musibah',
    emoji: '🌧️',
    color: 'from-teal-500/10 to-teal-600/5 hover:border-teal-300 dark:hover:border-teal-900',
    iconColor: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/40',
    titleFull: 'Menghadapi Musibah / Kesulitan Hidup',
    hadith: '“Sesungguhnya pertolongan Allah itu datang bersama dengan kesabaran, dan kelapangan itu datang bersama kesulitan.” (HR. Ahmad)',
    arab: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي',
    latin: 'Innaa lillaahi wa innaa ilaihi raaji\'uun. Allahumma-jurnii fii mushiibatii',
    arti: 'Sesungguhnya kami adalah milik Allah dan kepada-Nya lah kami kembali. Ya Allah, berilah pahala atas musibah yang menimpaku.',
    adab: 'Sabar di awal datangnya ujian, berhusnudzon pada takdir Allah, mendirikan shalat sunnah hajat, and ikhtiar bangkit secara tegar.',
    defaultDraft: 'Innalillahi wa inna ilaihi rajiun. Kami sedang menghadapi cobaan berat [SEBUTKAN JIKA INGIN]. Mohon fatihah dan doa dari kawan santri se-Indonesia agar kami diberi kesabaran luar biasa dan hikmah terbaik.'
  },
  {
    id: 'usaha',
    title: 'Usaha',
    emoji: '🏪',
    color: 'from-fuchsia-500/10 to-fuchsia-600/5 hover:border-fuchsia-300 dark:hover:border-fuchsia-900',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-950/40',
    titleFull: 'Rintisan Usaha Dagang / Bisnis Mandiri',
    hadith: '“Sembilan dari sepuluh pintu rezeki ada dalam perdagangan.” (HR. Thabrani)',
    arab: 'اللَّهُمَّ بَارِكْ لَنَا فِي رِزْقِنَا وَاجْعَلْهُ حَلَالًا طَيِّبًا مُبَارَكًا',
    latin: 'Allahumma baarik lanaa fii rizqinaa waj\'alhu halaalan thayyiban mubaarakan',
    arti: 'Ya Allah, berkahilah kami dalam rezeki kami, jadikanlah ia halal, baik, dan diberkahi.',
    adab: 'Jujur dalam bertransaksi, menjauhi kecurangan timbangan/takaran, bersedekah di pagi hari, serta menjaga kualitas barang.',
    defaultDraft: 'Bismillah, kami sedang merintis usaha perdagangan/bisnis [NAMA USAHA]. Mohon doa para guru & santri sekalian agar rintisan usaha kami dilindungi dari kerugian, berkah melimpah, dan mandiri secara ekonomi.'
  },
  {
    id: 'kesembuhan',
    title: 'Kesembuhan',
    emoji: '🏥',
    color: 'from-pink-500/10 to-pink-600/5 hover:border-pink-300 dark:hover:border-pink-900',
    iconColor: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/40',
    titleFull: 'Kesembuhan dari Penyakit (Syafahullah)',
    hadith: '“Obatilah orang-orang yang sakit di antara kalian dengan sedekah.” (HR. Abu Dawud)',
    arab: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي',
    latin: 'Allahumma rabban-naas adzhibil ba-sa isyfi Antas-Syaafii',
    arti: 'Ya Allah, Tuhan segenap manusia, hilangkanlah penyakit, sembuhkanlah karena Engkaulah Yang Menyembuhkan.',
    adab: 'Berobat sebagai ikhtiar dzahir, optimis akan pertolongan Allah, beristighfar sebagai sarana penggugur dosa, dan rajin sedekah.',
    defaultDraft: 'Assalamualaikum, mohon kerendahan hati doa fatihah jemaah santri Nusantara untuk kesembuhan [NAMA KELUARGA] yang saat ini diuji sakit. Semoga Allah mengangkat rasa sakitnya dan mengaruniakan kesembuhan bugar lahir batin.'
  },
  {
    id: 'dapat_kerja',
    title: 'Dapat Kerja',
    emoji: '💼',
    color: 'from-cyan-500/10 to-cyan-600/5 hover:border-cyan-300 dark:hover:border-cyan-900',
    iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40',
    titleFull: 'Melamar Pekerjaan & Memperoleh Karir Berkah',
    hadith: '“Mencari nafkah yang halal adalah bagian dari jihad di jalan-Nya.” (HR. Al-Dailami)',
    arab: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي وَوَسِّعْ لِي فِي رِزْقِي',
    latin: 'Allahummaghfir lii dzanbii wa wassi\' lii fii rizqii',
    arti: 'Ya Allah, ampunilah dosaku, luaskanlah duniaku, dan berkahilah aku dalam rezeki yang Engkau anugerahkan.',
    adab: 'Tawakal setelah menyelesaikan wawancara/test, selalu berbakti pada orang tua untuk kelancaran rida karir.',
    defaultDraft: 'Bismillah, kami sedang berjuang melamar pekerjaan/mengikuti tes rekruitmen di [PERUSAHAAN/LEMBAGA]. Mohon untaian barokah doanya agar dimudahkan lolos tes, diberi kepercayaan, dan rezeki yang lancar.'
  },
  {
    id: 'cari_nafkah',
    title: 'Cari Nafkah',
    emoji: '🛠️',
    color: 'from-orange-500/10 to-orange-600/5 hover:border-orange-300 dark:hover:border-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40',
    titleFull: 'Kelancaran Mencari Nafkah Halal',
    hadith: '“Siapa saja di sore hari merasa lelah mencari nafkah halal dengan tangannya, diampuni dosanya.” (HR. Thabrani)',
    arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ رِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    latin: 'Allahumma innii as-aluka rizqan thayyiban wa \'amalan mutaqabbalan',
    arti: 'Ya Allah, sesungguhnya aku memohon kepada-Mu rezeki yang baik dan amal pekerjaan yang diterima.',
    adab: 'Mulailah dengan basmalah di pagi hari, bersikap ramah, ulet, menghindari kecurangan, dan mengutamakan kewajiban shalat tepat waktu.',
    defaultDraft: 'Assalamualaikum, kami sedang mengikhtiarkan nafkah halal esok hari bagi anak istri. Mohon barokah doa jemaah santri agar langkah kami dipermudah di jalanan, dijauhi dari rintangan, dan penuh hasil berkah.'
  },
  {
    id: 'punya_anak',
    title: 'Punya Anak',
    emoji: '🍼',
    color: 'from-orange-500/10 to-orange-600/5 hover:border-orange-300 dark:hover:border-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40',
    titleFull: 'Ikhtiar Memperoleh Keturunan (Dzurriyah)',
    hadith: '“Bila manusia meninggal, terputus amalnya kecuali tiga perkara: salah satunya anak sholeh yang mendoakannya.” (HR. Muslim)',
    arab: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
    latin: 'Rabbi hab lii min ladunka dzurriyyatan thayyibatan innaka Samii\'ud-du\'aa',
    arti: 'Ya Tuhanku, berilah aku dari sisi-Mu keturunan yang baik. Sesungguhnya Engkau Maha Pendengar doa.',
    adab: 'Memperbanyak amalan sedekah anak yatim piatu, istighfar minimal 100x sehari secara kontinu, dan menguatkan tawakal.',
    defaultDraft: 'Bismillah, kami memohon fatihah dan doa bapak kiai serta rekan santri se-Indonesia, semoga Allah menganugerahkan keturunan yang sholeh-sholehah, penyejuk qolbu keluarga kami setelah sekian lama menanti.'
  },
  {
    id: 'pendidikan',
    title: 'Pendidikan',
    emoji: '📚',
    color: 'from-green-500/10 to-green-600/5 hover:border-green-300 dark:hover:border-green-900',
    iconColor: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/40',
    titleFull: 'Kelancaran Pendidikan & Ujian Santri',
    hadith: '“Barangsiapa menempuh suatu jalan demi mencari ilmu, Allah mudahkan baginya jalan ke surga.” (HR. Muslim)',
    arab: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
    latin: 'Rabbi zidnii \'ilmaa warzuqnii fahmaa',
    arti: 'Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan dan berilah aku pemahaman.',
    adab: 'Hormat luar biasa kepada kiai/ustadz pelita ilmu, belajar tulus bukan demi persaingan duniawi, serta rajin berwudhu.',
    defaultDraft: 'Assalamualaikum Wr. Wb. Kami/anak kami sedang menghadapi ujian kenaikan kelas / kelayakan hafalan kitab pesantren. Mohon keikhlasan barokah doa santri agar diberi keteguhan ingatan dan pemahaman luhur.'
  },
  {
    id: 'kandungan',
    title: 'Kandungan',
    emoji: '🤰',
    color: 'from-yellow-500/10 to-yellow-600/5 hover:border-yellow-300 dark:hover:border-yellow-900',
    iconColor: 'text-yellow-600 dark:text-yellow-400 bg-yellow-105 bg-yellow-100 dark:bg-yellow-950/40',
    titleFull: 'Keselamatan Masa Kehamilan & Kandungan Ibu',
    hadith: '“Membaca untaian firman suci kala hamil menguatkan batin ruh sang bayi.” (Syarah Al-Hikam)',
    arab: 'اللَّهُمَّ احْفَظْ وَلَدِي مَا دَامَ فِي بَطْنِي وَاشْفِهِ أَنْتَ الشَّافِي',
    latin: 'Allahummah-fazh waladii maa daama fii bathnii wasyfihi Antas-Syaafii',
    arti: 'Ya Allah, jagalah janin bayi kami selama ia berada di dalam kandungan ibunya, dan berilah ia kesehatan.',
    adab: 'Melazimkan membaca Al-Qur\'an khususnya Surah Yusuf dan Surah Maryam, menjaga kestabilan emosi bahagia, dan rutin berkonsultasi secara medis.',
    defaultDraft: 'Bismillah, kehamilan istri kami saat ini memasuki bulan ke-[BULAN] bulan. Mohon untaian doa tulus dari para kiai & santri agar ibu dan calon bayi dikaruniai kekuatan, aman dari kendala, hingga melahirkan nanti.'
  },
  {
    id: 'lainnya',
    title: 'Lainnya',
    emoji: '🌟',
    color: 'from-lime-500/10 to-lime-600/5 hover:border-lime-300 dark:hover:border-lime-900',
    iconColor: 'text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-950/40',
    titleFull: 'Hajat Khusus / Kebutuhan Kemaslahatan Lain-Lain',
    hadith: '“Mintalah kepada Tuhanmu akan segala kebutuhanmu, sampaikan walau sekadar tali sandal yang terputus.” (HR. Tirmidzi)',
    arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
    latin: 'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan',
    arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat.',
    adab: 'Memuliakan adab tadharru\' (merendahkan ucapan), tidak berputus asa sekecil apa pun kebutuhan, dan dilandasi niat ikhlas.',
    defaultDraft: 'Bismillah, kami memiliki hajat mendesak terkait [HAJAT KITA]. Mohon barokah doa restu dari para kiai se-Indonesia agar hajat berniat baik ini dipermulus jalannya oleh rida terbaik-Nya.'
  }
];

const PrayerRequestScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedHajatCategory, setSelectedHajatCategory] = useState<any | null>(null);
  
  // Custom Baby birth dates states
  const [customBabyName, setCustomBabyName] = useState('');
  const [customBabyBirthDate, setCustomBabyBirthDate] = useState('');
  const [customBabyParents, setCustomBabyParents] = useState('');
  
  // Custom Deceased states
  const [customDeadName, setCustomDeadName] = useState('');
  const [customDeadType, setCustomDeadType] = useState<'Bin' | 'Binti'>('Bin');
  const [customDeadParent, setCustomDeadParent] = useState('');
  const [customDeadDate, setCustomDeadDate] = useState('');

  // Custom draft & details states
  const [customHajatDraft, setCustomHajatDraft] = useState('');
  const [hajatTitleInput, setHajatTitleInput] = useState('');
  const [hajatTargetPrayers, setHajatTargetPrayers] = useState(15);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submittingHajat, setSubmittingHajat] = useState(false);

  // Subtab switchers
  const [mintaDoaSubTab, setMintaDoaSubTab] = useState<'panduan' | 'ai' | 'doaPreset'>('ai');
  const [aiHajatQuery, setAiHajatQuery] = useState('');
  const [aiCreatedDoa, setAiCreatedDoa] = useState<{ arab: string; latin: string; arti: string; hikmah: string } | null>(null);
  const [aiCreatingDoa, setAiCreatingDoa] = useState(false);

  // Auto compile baby draft
  useEffect(() => {
    if (selectedHajatCategory && selectedHajatCategory.id === 'kelahiran') {
      const name = customBabyName.trim() || '[Nama Lengkap Anak]';
      const date = customBabyBirthDate.trim() || '[Tanggal Lahir]';
      const parents = customBabyParents.trim() || '[Nama Orang Tua / Pasangan]';
      
      const drafted = `Bismillah, telah lahir dengan sehat dan selamat putra/putri kami tercinta: ${name}, anak dari pasangan ${parents} pada tanggal ${date}. Mohon ridha doanya agar menjadi anak yang sholeh/sholehah, berbakti, berakal cerdas, dan berkah ilmunya.`;
      setCustomHajatDraft(drafted);
    }
  }, [customBabyName, customBabyBirthDate, customBabyParents, selectedHajatCategory]);

  // Auto compile deceased draft
  useEffect(() => {
    if (selectedHajatCategory && (selectedHajatCategory.id === 'meninggal' || selectedHajatCategory.id === 'tahlil_haul')) {
      const name = customDeadName.trim() || '[Nama Almarhum/Almarhumah]';
      const parentName = customDeadParent.trim() || '[Nama Ayah/Ibu]';
      const suffix = customDeadType;
      const date = customDeadDate.trim() || '[Hari/Tanggal Wafat]';
      
      const almarhumLabel = suffix === 'Bin' ? 'almarhum' : 'almarhumah';
      const drafted = `Mohon keikhlasan doa fatihah dari para santri sekalian untuk ${almarhumLabel} keluarga kami tercinta: ${name} ${suffix} ${parentName}, yang telah berpulang ke Rahmatullah pada ${date}. Semoga diampuni khilafnya, dilapangkan kuburnya, dan dikumpulkan di jannah-Nya.`;
      setCustomHajatDraft(drafted);
    }
  }, [customDeadName, customDeadType, customDeadParent, customDeadDate, selectedHajatCategory]);

  const compileFullPrayerText = () => {
    if (!selectedHajatCategory) return '';

    return `Assalamualaikum Wr. Wb.

Bismillahir-rahmanir-rahim.
Alhamdulillahirabbil 'alamin, wash-shalatu was-salamu 'ala Sayyidina Muhammadin wa 'ala alihi wa shahbihi ajma'in.

Dengan segala kerendahan hati, kami sekeluarga memohon keikhlasan tawassul, fatihah, serta untaian doa dari para kiai, ustadz, dan rekan santri di Nusantara terkait hajat/permohonan kami berikut ini:

📝 [HAJAT & PERMOHONAN]
"${customHajatDraft}"

Sebagai perantara (wasilah) spiritual, mari kita bersama-sama mengamalkan doa mustajab dan sunnah yang dianjurkan khusyuk berikut:

🤲 [LAFADZ DOA YANG DIANJURKAN]
${selectedHajatCategory.arab || ''}

👉 [Latin]: ${selectedHajatCategory.latin || ''}
👉 [Artinya]: "${selectedHajatCategory.arti || ''}"

✨ [MUTIARA HADITS / ATSAR]
${selectedHajatCategory.hadith || ''}

📌 [ADAB & IKHTIAR AMALAN]
${selectedHajatCategory.adab || ''}

Semoga setiap huruf fatihah dan untaian doa tulus yang Anda hadiahkan menjadi timbangan amal kebaikan yang berat, pembuka pintu berkah, serta diijabah oleh Allah SWT dengan cara terbaik-Nya. Jazakumullah khairul jaza' katsiran.

Wassalamu'alaikum Wr. Wb.`;
  };

  const handleGenerateAiDoa = async () => {
    if (!aiHajatQuery.trim()) {
      showToast("Tuliskan hajat atau keinginan Anda terlebih dahulu!", "error");
      return;
    }
    setAiCreatingDoa(true);
    setAiCreatedDoa(null);
    try {
      const prompt = `Bertindaklah sebagai asisten peracik dan penyusun doa khusus santri dan umat Islam.
      User menuliskan hajat/keinginannya: "${aiHajatQuery}"
      Susunlah doa yang sangat indah, khusyuk, menyentuh hati, fasih, dan sesuai dengan adab berdoa dalam Islam.
      Beberapa rujukan indah bisa dari Al-Quran, hadis yang sesuai, atau untaian doa indah ulama Salaf.
      Anda musti memformat output dalam JSON murni dengan persis kunci ini:
      {
        "arab": "Teks Arab doa lengkap dengan harakat",
        "latin": "Cara membaca doa dalam huruf latin",
        "arti": "Terjemahan bahasa Indonesia yang mengalir indah",
        "hikmah": "Saran amalan rohani atau tips pendek (1-2 kalimat) dari kacamata hikmah kiai pesantren terkait hajat ini"
      }`;
      const response = await generateJson(prompt, "Pakar Doa dan Penyusun Untaian Kalimat Thayyibah.");
      if (response && response.arab) {
        setAiCreatedDoa(response);
        showToast("Doa indah berhasil diracik oleh Asisten AI!", "success");
      } else {
        throw new Error("Format tidak sesuai");
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal meracik doa dengan AI, silakan cari inspirasi di Koleksi Doa Mustajab atau coba lagi.", "error");
    } finally {
      setAiCreatingDoa(false);
    }
  };

  const handleOpenHajatCategory = (cat: any) => {
    setSelectedHajatCategory(cat);
    setAgreeToTerms(false);
    setHajatTargetPrayers(15);
    setHajatTitleInput(cat.titleFull || cat.title);
    
    if (cat.id === 'kelahiran') {
      setCustomBabyName('');
      setCustomBabyBirthDate('');
      setCustomBabyParents('');
      setCustomHajatDraft(cat.defaultDraft);
    } else if (cat.id === 'meninggal' || cat.id === 'tahlil_haul') {
      setCustomDeadName('');
      setCustomDeadType('Bin');
      setCustomDeadParent('');
      setCustomDeadDate('');
      setCustomHajatDraft(cat.defaultDraft);
    } else {
      setCustomHajatDraft(cat.defaultDraft || '');
    }
  };

  const handleSendHajatToForum = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk mengirim hajat!", "error");
      return;
    }

    const isVerified = userData?.verificationBadge === 'badge_purple' || 
                       userData?.verificationBadge === 'badge_blue' || 
                       userData?.verificationBadge === 'badge_red';
    if (!isVerified) {
      showToast("Lencana verifikasi diperlukan untuk mengirim permohonan doa. Silakan aktifkan lencana verifikasi terlebih dahulu di Toko Lencana.", "warning");
      navigate('/badge-shop');
      return;
    }

    if (!customHajatDraft.trim()) {
      showToast("Teks hajat tidak boleh kosong!", "error");
      return;
    }
    if (!agreeToTerms) {
      showToast("Anda harus menyetujui Syarat & Ketentuan terlebih dahulu!", "error");
      return;
    }

    const costAmount = 15;
    const userWasilah = userData?.wasilah ?? 0;
    if (userWasilah < costAmount) {
      showToast(`Poin Wasilah Anda tidak mencukupi untuk mengirim hajat ini (Dibutuhkan ${costAmount} Wasilah, saat ini Anda memiliki ${userWasilah} Wasilah). Silakan lakukan pengisian koin Wasilah terlebih dahulu di menu Layanan Pro & Wasilah!`, "error");
      return;
    }

    setSubmittingHajat(true);
    try {
      const rewardAmount = 10; 
      
      const fullCustomDescription = compileFullPrayerText();
      
      await createPrayerRequest(user, {
        title: hajatTitleInput.trim() || selectedHajatCategory.titleFull || selectedHajatCategory.title,
        description: fullCustomDescription,
        category: selectedHajatCategory.title,
        targetPrayers: hajatTargetPrayers,
        rewardAmount: rewardAmount,
        costAmount: costAmount,
        aiPrayerContent: selectedHajatCategory.arab ? `${selectedHajatCategory.arab}\n\nLatin: ${selectedHajatCategory.latin}\n\nArti: ${selectedHajatCategory.arti}` : ""
      }, userData);

      showToast("Alhamdulillah! Hajat Anda berhasil dikirim ke Forum Santri.", "success");
      setSelectedHajatCategory(null);
      navigate('/community');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Gagal mengirim permohonan doa, silakan periksa poin Wasilah Anda.", "error");
    } finally {
      setSubmittingHajat(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 overflow-hidden relative shadow-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Akses Terbatas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Anda harus masuk atau mendaftar terlebih dahulu untuk dapat mengajukan permohonan doa.
          </p>
          <button 
            type="button"
            onClick={() => navigate('/settings')}
            className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Masuk / Register
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs mt-3 hover:text-slate-600 transition-colors"
          >
            Kembali
          </button>
        </motion.div>
      </div>
    );
  }

  const isVerified = userData?.verificationBadge === 'badge_purple' || 
                     userData?.verificationBadge === 'badge_blue' || 
                     userData?.verificationBadge === 'badge_red';

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col font-sans transition-colors duration-200 text-gray-800 dark:text-gray-100">
      
      {/* Curved Green Sticky Header - Shorter & Consistent with other screens */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#0B5C41] to-[#073E2C] dark:from-emerald-950 dark:to-gray-950 px-4 pt-3.5 pb-2.5 rounded-b-[1.5rem] shadow-md border-b border-emerald-800/20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button 
            type="button"
            onClick={() => {
              if (selectedHajatCategory) {
                setSelectedHajatCategory(null);
              } else {
                navigate(-1);
              }
            }} 
            className="p-2 bg-white/10 dark:bg-white/5 text-white hover:bg-white/15 active:scale-95 rounded-full transition-all cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-left">
            <h2 className="font-bold text-base md:text-lg text-white flex items-center gap-2 leading-none">
              <HelpingHand className="w-4 h-4 text-emerald-300 shrink-0" />
              {selectedHajatCategory ? `${selectedHajatCategory.title}` : 'Bantu Doa'}
            </h2>
          </div>

          {/* Wasilah Display */}
          <div className="flex items-center gap-1 bg-white/10 dark:bg-emerald-900/40 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-white/15">
            <Gem size={13} className="text-cyan-400 fill-cyan-400/20 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black text-cyan-50">
              {(userData?.wasilah || 0).toLocaleString()}
            </span>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all flex-shrink-0 cursor-pointer p-0.5 rounded-full bg-white/15 hover:bg-white/25"
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

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-grow">
        
        {selectedHajatCategory ? (
          /* ==========================================================
             SUBPAGE MODE: Form input fields & Beautiful compiled output
             ========================================================== */
          <div className="space-y-6">
            
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {selectedHajatCategory.emoji}
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black leading-none block">
                    Kategori Hajat Pilihan
                  </span>
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white mt-1">
                    {selectedHajatCategory.titleFull || selectedHajatCategory.title}
                  </h3>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedHajatCategory(null)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Ubah Kategori
              </button>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-left"
            >
              {/* 1. Born details input form (Kelahiran) */}
              {selectedHajatCategory.id === 'kelahiran' && (
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 text-left shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">👶 Detail Kelahiran Bayi</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Nama Lengkap Bayi</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Muhammad Yusuf Al-Karim" 
                        value={customBabyName} 
                        onChange={(e) => setCustomBabyName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Tanggal Kelahiran</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Ahad Kliwon, 24 Mei 2026" 
                        value={customBabyBirthDate} 
                        onChange={(e) => setCustomBabyBirthDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="text-left pt-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Nama Kedua Orang Tua / Wali</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Bpk. Ahmad & Ibu Siti Aminah" 
                      value={customBabyParents} 
                      onChange={(e) => setCustomBabyParents(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {/* 2. Deceased details input form (Meninggal & Tahlil/Haul) */}
              {(selectedHajatCategory.id === 'meninggal' || selectedHajatCategory.id === 'tahlil_haul') && (
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4 text-left shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">🕊️ Detail Almarhum / Almarhumah</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Nama Almarhum/Almarhumah</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: KH. Wahid Hasyim" 
                        value={customDeadName} 
                        onChange={(e) => setCustomDeadName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Hubungan Nasab</label>
                      <div className="flex gap-2.5">
                        <button 
                          type="button" 
                          onClick={() => setCustomDeadType('Bin')}
                          className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${customDeadType === 'Bin' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-850'}`}
                        >
                          Bin (Laki-laki)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setCustomDeadType('Binti')}
                          className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${customDeadType === 'Binti' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-850'}`}
                        >
                          Binti (Perempuan)
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-1">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Nama Ayah (Bin/Binti Siapa)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Bpk. Hasyim Asy'ari" 
                        value={customDeadParent} 
                        onChange={(e) => setCustomDeadParent(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1.5">Waktu Meninggal (Hari/Tanggal)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Kamis Wage, 14 Mei 2026" 
                        value={customDeadDate} 
                        onChange={(e) => setCustomDeadDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. General Title & Harapan/Draft Input */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1 font-bold">Tulis/Perbaiki Judul Hajat di Forum</label>
                  <input 
                    type="text"
                    value={hajatTitleInput}
                    onChange={(e) => setHajatTitleInput(e.target.value)}
                    placeholder="Contoh: Syukuran Kelahiran Anak Pertama / Ringankan Beban Hutang Kami..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5 text-left pt-1">
                  <div className="flex justify-between items-center text-left">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block font-bold">
                      {['kelahiran', 'meninggal', 'tahlil_haul'].includes(selectedHajatCategory.id) 
                        ? "Draf Naskah Harapan (Dapat Anda Ubah Sesuka Hati)" 
                        : "Tuliskan Harapan, Doa Khusus & Kebutuhan Utama Anda"}
                    </label>
                    <span className="text-[9px] font-black text-emerald-650 bg-emerald-50 dark:bg-emerald-950/25 px-2.5 py-1 rounded uppercase">Dapat Diedit</span>
                  </div>
                  <textarea
                    rows={5}
                    value={customHajatDraft}
                    onChange={(e) => setCustomHajatDraft(e.target.value)}
                    placeholder="Tuliskan harapan, kisah duka/cita batin, atau permohonan hajat Anda sejelas-jelasnya agar santri se-Indonesia dapat ikut merasai dan mendoakan tulus..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm whitespace-pre-wrap text-left font-medium"
                  />
                </div>
              </div>

              {/* 4. Complete Compiled Prayer Document Live Preview */}
              <div className="p-6 bg-[#FAF6EE] dark:bg-gray-900/40 border-2 border-[#EBE3D5] dark:border-gray-800 rounded-2xl space-y-4 text-left shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 py-1.5 px-4 bg-emerald-600 text-white rounded-bl-2xl text-[9px] font-black uppercase tracking-widest font-bold">
                  Dokumen Doa Forum
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-bold">
                    Pratinjau Surat Doa Lengkap (Hasil Racikan Rapi)
                  </span>
                </div>
                
                <div className="bg-white/90 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 p-5 rounded-xl max-h-80 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-gray-750 dark:text-gray-350 shadow-inner select-text">
                  {compileFullPrayerText()}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 italic max-w-2xl leading-normal">
                  * Naskah di atas memadukan permohonan hajat Anda dengan dalil hadits riwayat syariah, wasilah lafadz doa Arab/Latin/Arti pilihan, serta penutup silsilah santri se-Indonesia secara rapi dan hikmah.
                </p>
              </div>

              {/* 5. Target Doa & S&K Check */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                <div className="bg-emerald-50/15 dark:bg-emerald-950/10 p-5 rounded-xl border border-dashed border-emerald-250 dark:border-emerald-900 text-left">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-gray-650 dark:text-gray-400 uppercase tracking-wide">Target kuota pendoa santri</span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/45 px-3 py-1 rounded-full">{hajatTargetPrayers} Doa Santri</span>
                  </div>
                  <input 
                    type="range" 
                    min={5} 
                    max={50} 
                    step={1}
                    value={hajatTargetPrayers} 
                    onChange={(e) => setHajatTargetPrayers(Number(e.target.value))}
                    className="w-full h-2 rounded-lg cursor-pointer bg-gray-200 dark:bg-gray-850 accent-emerald-600"
                  />
                  <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-3 uppercase tracking-wider">
                    <span>Biaya Wasilah: 15 Poin</span>
                    <span>Penghargaan Pendoa: +10W per doa</span>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none text-left p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850/30 transition-colors">
                  <input 
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 accent-emerald-600 rounded border-gray-300 w-4 h-4 shrink-0 cursor-pointer"
                  />
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed text-left font-semibold">
                    Saya bersaksi naskah hajat doa di atas halalan thayyiban, tidak mengandung permusuhan, melanggar S&K, dan tulus mengikuti <span className="text-emerald-600 dark:text-emerald-400 underline font-black">Adab Doa Pesantren</span>.
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHajatCategory(null)}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-600 dark:bg-gray-900 dark:hover:bg-gray-850 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSendHajatToForum}
                  disabled={submittingHajat || !agreeToTerms}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-150 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-650/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingHajat ? (
                     <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Kirim Hajat ke Forum Santri
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ==========================================================
             MAINPAGE MODE: Kategori Selection Grid and Accordions
             ========================================================== */
          <div className="space-y-6">
            
            {/* ACCORDION EXPLANATIONS */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-900/60 p-1.5 space-y-1.5 shadow-sm">
              
              {/* Accordion 1: Tentang */}
              <div className="border border-gray-100 dark:border-gray-800/60 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'tentang' ? null : 'tentang')}
                  className="w-full flex justify-between items-center px-4 py-3.5 bg-gray-50/50 dark:bg-gray-950/25 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left outline-none cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                    📖 Tentang Fitur 'Bantu Doa'
                  </span>
                  {openAccordion === 'tentang' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'tentang' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 py-3.5 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 leading-relaxed space-y-2 text-justify font-medium"
                    >
                      <p>
                        Fitur <strong>Bantu Doa</strong> di platform Santri Modern dirancang untuk membina sinergi spiritual dan memperkuat tali keluhuran ukhuwah Islamiyah di antara para santri se-Indonesia secara online.
                      </p>
                      <p>
                        Kami percaya bahwa kekuatan <i>doa bersama</i> memiliki keistimewaan tersendiri di sisi Allah SWT, khususnya bila dimohonkan oleh sesama penuntut ilmu syar'i (santri) yang berjuang menjaga agama.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Panduan */}
              <div className="border border-gray-100 dark:border-gray-800/60 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'panduan_acc' ? null : 'panduan_acc')}
                  className="w-full flex justify-between items-center px-4 py-3.5 bg-gray-50/50 dark:bg-gray-950/25 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left outline-none cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                    💡 Panduan Penggunaan Fitur
                  </span>
                  {openAccordion === 'panduan_acc' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'panduan_acc' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 py-4 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 leading-relaxed space-y-3 font-medium"
                    >
                      <div className="flex gap-2.5 items-start text-left">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</div>
                        <p>
                          <strong>Pilih Kategori Hajat:</strong> Ketuk salah satu dari kartu hajat di bawah (seperti kematian, kelahiran, rezeki) untuk membuka halaman asisten khusus yang otomatis menyebarkan draf doa & hadits rekomendasi mutiara syariah.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start text-left">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</div>
                        <p>
                          <strong>Lengkapi Draf Otomatis:</strong> Isikan data-data penunjang (seperti nama almarhum atau nama kelahiran bayi) yang secara cerdas akan langsung merancang format naskah doa Anda secara detail dan rapi.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start text-left">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</div>
                        <p>
                          <strong>Kirim ke Forum Santri:</strong> Luncurkan permohonan Anda ke timeline forum. Rekan santri Nusantara dapat berpartisipasi dan langsung memberikan hadiah Surat Al-Fatihah dan untaian doa barokah.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: S&K */}
              <div className="border border-gray-100 dark:border-gray-800/60 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'rules_acc' ? null : 'rules_acc')}
                  className="w-full flex justify-between items-center px-4 py-3.5 bg-gray-50/50 dark:bg-gray-950/25 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left outline-none cursor-pointer"
                >
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 uppercase tracking-wide">
                    📜 Syarat & Ketentuan Adab Berdoa (S&K)
                  </span>
                  {openAccordion === 'rules_acc' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'rules_acc' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 py-3.5 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 leading-relaxed space-y-2 text-justify font-medium"
                    >
                      <ul className="list-disc pl-4 space-y-1.5">
                        <li>Hajat dan permohonan santri wajib halal, bebas dari penyebutan kemungkaran, kebencian, perjudian, permusuhan, maupun perpecahan yang bertolak belakang dengan syariat Ahlussunnah wal Jama'ah.</li>
                        <li>Aktivitas menyebarkan dusta, hoaks secara sengaja atau candaan yang menyimpang akan ditindak tegas oleh Admin (Penalti akun permanen).</li>
                        <li>Setiap poster hajat santri diwajibkan mengalokasikan poin Wasilah penjamin sebesar 15 poin untuk menjamin kesungguhan dan menghargai ketulusan pendoa.</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Kategori Doa Grid Section */}
            <div className="space-y-4 pt-4 text-left">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-bold">
                👉 Pilih salah satu kategori di bawah ini:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-2">
                {HAJAT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleOpenHajatCategory(cat)}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center relative overflow-hidden shadow-sm hover:border-emerald-500 hover:shadow-md dark:hover:border-emerald-800"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/25 flex items-center justify-center text-2xl mb-3.5 shrink-0 shadow-inner">
                      {cat.emoji}
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-100 tracking-tight leading-none uppercase font-bold truncate w-full">
                      {cat.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Wasilah Info Card */}
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
              <Info size={20} className="flex-shrink-0 text-emerald-600" />
              <p className="text-left font-medium leading-relaxed italic">
                Wasilah yang Anda keluarkan (15 Poin) adalah bentuk tanda syukur Anda kepada rekan santri se-Indonesia yang meluangkan waktu dan kekhusyukan untuk mendoakan hajat Anda.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PrayerRequestScreen;
