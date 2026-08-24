
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Type, 
  Moon, 
  Sun,
  Scroll,
  Info,
  CheckCircle2,
  List,
  Fingerprint,
  RotateCcw
} from 'lucide-react';

const TAHLIL_DATA = [
  {
    id: 'hadrah',
    title: 'Hadrah (Tawasul)',
    description: 'Mengirimkan pahala bacaan kepada Nabi Muhammad SAW, keluarga, sahabat, tabirin, dan para wali.',
    content: [
      {
        arabic: 'إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَاَلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ الْكِرَامِ، شَيْءٌ لِلَّهِ لَهُمُ الْفَاتِحَةُ',
        latin: "Ilaa hadhratin nabiyyil mushthafaa shallallaahu 'alaihi wa sallama wa aalihi wa azwaajihi wa dzurriyyaatihi wa ahli baytihil kiraam, syai-un lillaahi lahumul faatihah.",
        translation: 'Kehadirat Nabi yang terpilih, semoga Allah memberi shalawat dan salam kepadanya, keluarganya, istri-istrinya, keturunannya, dan ahli baitnya yang mulia. Sesuatu bagi Allah, bagi mereka (kami bacakan) Al-Fatihah.'
      }
    ]
  },
  {
    id: 'khushushan',
    title: 'Khushushan (Dikhususkan)',
    description: 'Mendoakan khusus untuk ahli kubur (Sebutkan nama almarhum/ah di dalam hati).',
    content: [
      {
        arabic: 'ثُمَّ إِلَى أَرْوَاحِ إِخْوَانِهِ مِنَ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِينَ وَالصَّحَابَةِ وَالتَّابِعِينَ وَالْعُلَمَاءِ الْعَامِلِينَ وَالْمُصَنِّفِينَ الْمُخْلِصِينَ وَجَمِيعِ الْمَلَائِكَةِ الْمُقَرَّبِينَ، خُصُوصًا سَيِّدِنَا الشَّيْخِ عَبْدِ الْقَادِرِ الْجَيْلَانِيِّ، ثُمَّ إِلَى جَمِيعِ أَهْلِ الْقُبُورِ مِنَ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ مِنْ مَشَارِقِ الْأَرْضِ إِلَى مَغَارِبِهَا بَرِّهَا وَبَحْرِهَا خُصُوصًا إِلَى رُوْحِ (......) الفاتحة',
        latin: "Tsumma ilaa arwaahi ikhwaanihi minal anbiyaa-i wal mursaliin wal awliyaa-i wasy syuhadaa-i wash shaalihiin wash shahaabati wat taabi'iin wal 'ulamaa-il 'aamiliin wal mushannifiinal mukhlishiin wa jamii'il malaa-ikatil muqarrabiin, khushuushan sayyidinaasy syaikh 'abdil qaadiril jaylaanii, tsumma ilaa jamii'i ahlil qubuuri minal muslimiina wal muslimaat wal mu'miniina wal mu'minaat min masyaariqil ardhi ilaa maghaaribihaa barrihaa wa bahrihaa khushuushan ilaa ruuhi (Sebutkan Nama Almarhum/ah) Al-Faatihah.",
        translation: 'Kemudian kepada arwah saudara-saudaranya dari para nabi, rasul, wali, syuhada, orang-orang saleh, sahabat, tabi\'in, ulama yang mengamalkan ilmunya, penulis yang ikhlas, dan seluruh malaikat muqarrabin, khususnya pemimpin kita Syekh Abdul Qadir Al-Jailani. Kemudian kepada seluruh ahli kubur dari kaum Muslimin dan Muslimat, kaum Mukminin dan Mukminat, dari timur hingga ke barat, di daratan maupun di lautan, khususnya kepada arwah (sebutkan nama almarhum/ah) Al-Fatihah.'
      }
    ]
  },
  {
    id: 'ikhlas',
    title: 'Surah Al-Ikhlas (3x)',
    content: [
      {
        arabic: 'قُلْ هُوَ اللهُ أَحَدٌ، اللهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        latin: 'Qul huwalaahu ahad, allaahush shamad, lam yalid walam yuulad, walam yakun lahu kufuwan ahad.',
        translation: 'Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorangpun yang setara dengan Dia.'
      }
    ]
  },
  {
    id: 'falaq',
    title: 'Surah Al-Falaq',
    content: [
      {
        arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        latin: 'Qul a\'udzu birabbil falaq, min syarri maa khalaq, wamin syarri ghaasiqin idzaa waqab, wamin syarrin naffaatsaati fil \'uqad, wamin syarri haasidin idzaa hasad.',
        translation: 'Katakanlah: Aku berlindung kepada Tuhan Yang Menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang meniup pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki.'
      }
    ]
  },
  {
    id: 'nas',
    title: 'Surah An-Naas',
    content: [
      {
        arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ',
        latin: 'Qul a\'udzu birabbin naas, malikin naas, ilaahin naas, min syarril waswaasil khannaas, alladzii yuwaswisu fii shuduurin naas, minal jinnati wannaas.',
        translation: 'Katakanlah: Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia.'
      }
    ]
  },
  {
    id: 'baqarah1',
    title: 'Al-Baqarah 1-5',
    content: [
      {
        arabic: 'الَمَ، ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ، الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ، وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ، أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ',
        latin: 'Alif laam miim. Dzaalikal kitaabu laa raiba fiihi hudan lil muttaqiin. Alladziina yu\'minuuna bil ghaibi wa yuqiimuunash shalaata wa mimmaa razaqnaahum yunfiquun. Walladziina yu\'minuuna bimaa unzila ilaika wa maa unzila min qablika wa bil aakhirati hum yuuqinuun. Ulaa-ika \'alaa hudam mir rabbihim wa ulaa-ika humul muflihuun.',
        translation: 'Alif laam miim. Kitab (Al-Quran) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa, (yaitu) mereka yang beriman kepada yang ghaib, yang mendirikan shalat, dan menafkahkan sebahagian rezeki yang Kami anugerahkan kepada mereka. Dan mereka yang beriman kepada Kitab (Al-Quran) yang telah diturunkan kepadamu dan kitab-kitab yang telah diturunkan sebelummu, serta mereka yakin akan adanya (kehidupan) akhirat. Mereka itulah yang tetap mendapat petunjuk dari Tuhan mereka, dan merekalah orang-orang yang beruntung.'
      }
    ]
  },
  {
    id: 'kursi',
    title: 'Ayat Kursi',
    content: [
      {
        arabic: 'اَللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        latin: "Allaahu laa ilaaha illaa huwal hayyul qayyuum, laa ta'khudzuhu sinatuw walaa nawm, lahu maa fis samaawaati wa maa fil ardh, man dzalladzii yasyfa'u 'indahu illaa bi-idznih, ya'lamu maa bayna aydiihim wa maa khalfahum, walaa yuhiithuuna bisyai-im min 'ilmihi illaa bimaa syaa-a, wasi'a kursiyyuhus samaawaati wal ardh, walaa ya-uuduhu hifzhuhumaa, wa huwal 'aliyyul 'azhiim.",
        translation: 'Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tiada yang dapat memberi syafa\'at di sisi Allah tanpa izin-Nya? Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar.'
      }
    ]
  },
  {
    id: 'istighfar',
    title: 'Istighfar (3x)',
    content: [
      {
        arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيْمَ (3x)، الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        latin: "Astaghfirullaahal 'azhiim (3x), alladzii laa ilaaha illa huwal hayyul qayyumu wa atuubu ilaih.",
        translation: 'Aku memohon ampun kepada Allah Yang Maha Agung (3x), yang tiada Tuhan selain Dia Yang hidup kekal lagi terus menerus mengurus (makhluk-Nya), dan aku bertobat kepada-Nya.'
      }
    ]
  },
  {
    id: 'tahlil_core',
    title: 'Kalimat Tahlil (100x)',
    target: 100,
    content: [
      {
        arabic: 'لَا إِلَهَ إِلَّا اللهُ',
        latin: 'Laa ilaha illallah.',
        translation: 'Tiada Tuhan selain Allah.'
      }
    ]
  },
  {
    id: 'doa_tahlil',
    title: 'Doa Tahlil',
    description: 'Doa penutup rangkaian tahlil.',
    content: [
      {
        arabic: 'اللَّهُمَّ اجْعَلْ وَأَوْصِلْ وَتَقَبَّلْ ثَوَابَ مَا قَرَأْنَاهُ مِنَ الْقُرْآنِ الْعَظِيمِ وَمَا هَلَّلْنَاهُ وَمَا سَبَّحْنَاهُ وَمَا اسْتَغْفَرْنَاهُ وَمَا صَلَّيْنَاهُ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ هَدِيَّةً وَاصِلَةً وَرَحْمَةً نَازِلَةً وَبَرَكَةً شَامِلَةً إِلَى حَضْرَةِ حَبِيبِنَا وَشَفِيعِنَا وَقُرَّةِ أَعْيُنِنَا سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَإِلَى أَرْوَاحِ جَمِيعِ إِخْوَانِهِ مِنَ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ ...',
        latin: "Allaahummaj'al wa awshil wa taqabbal thawaaba maa qara-naahu minal qur-aanil 'azhiimi wa maa hallalnaahu wa maa sabbahnaahu wa mas taghfarnaahu wa maa shallaynaahu 'alaa sayyidinaa muhammadin shallallaahu 'alaihi wa sallama hadiyyatan waashilatan wa rahmatan naazilatan wa barakatan syaamilatan ilaa hadhrati habiibinaa wa syafii'inaa wa qurrata a'yuninaa sayyidinaa wa mawlaanaa muhammadin shallallaahu 'alaihi wa sallama wa ilaa arwaahi jamii'i ikhwaanihi minal anbiyaa-i wal mursaliin...",
        translation: 'Ya Allah, jadikanlah, sampaikanlah dan terimalah pahala bacaan kami dari Al-Quran yang agung, tahlil kami, tasbih kami, istighfar kami, dan shalawat kami kepada pemimpin kami Muhammad shallallahu \'alaihi wa sallam sebagai hadiah yang sampai, rahmat yang turun, dan berkah yang menyeluruh kepada kekasih kami, pemberi syafaat kami, dan buah hati kami pemimpin kami Muhammad shallallahu \'alaihi wa sallam dan kepada arwah seluruh saudara-saudaranya dari para nabi dan rasul...'
      }
    ]
  }
];

const TahlilScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  // State for reading settings
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [count, setCount] = useState(0);

  // Reset count when changing section
  useEffect(() => {
    setCount(0);
  }, [currentIndex]);

  const incrementCount = () => {
    const target = (currentSection as any).target || 0;
    if (target > 0 && count < target) {
      setCount(prev => prev + 1);
      // Optional: Add haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    } else if (target === 0) {
      setCount(prev => prev + 1);
    }
  };

  // Total pages
  const totalPages = TAHLIL_DATA.length;

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentSection = TAHLIL_DATA[currentIndex];

  const fontSizeClasses = {
    sm: 'text-2xl',
    base: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#005a2b] dark:bg-emerald-950 text-white pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md flex items-center justify-between gap-3 transition-colors mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-widest leading-none">Tahlil Lengkap</h1>
            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-tighter mt-1">{currentSection.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 rounded-xl transition-colors hover:bg-white/10 text-white"
          >
            {isDarkMode ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className={`p-2 rounded-xl transition-colors hover:bg-white/10 ${showMenu ? 'bg-white/20 text-white' : 'text-white'}`}
          >
            <Settings size={20} />
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
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`overflow-hidden border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
          >
            <div className="p-4 space-y-4 max-w-2xl mx-auto">
              {/* Font Size Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
                  <Type size={14} /> Ukuran Huruf
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['sm', 'base', 'lg', 'xl'].map((size) => (
                    <button 
                      key={size}
                      onClick={() => setFontSize(size as any)}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                        fontSize === size 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'text-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowLatin(!showLatin)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    showLatin 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">Teks Latin</span>
                  {showLatin ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                </button>
                <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    showTranslation 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">Terjemahan</span>
                  {showTranslation ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-12 pb-40">
        <div className="mb-10">
           <div className="flex items-center gap-2 mb-3 text-emerald-600">
              <Scroll size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentSection.id === 'hadrah' ? 'Pendahuluan' : 'Rangkaian'} {currentIndex + 1} / {totalPages}</span>
           </div>
           <h2 className="text-3xl font-black tracking-tight">{currentSection.title}</h2>
           {currentSection.description && (
             <p className={`text-sm font-medium mt-3 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               {currentSection.description}
             </p>
           )}
        </div>

        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
           {currentSection.content.map((item, idx) => (
             <div key={idx} className="space-y-6">
                {/* Arabic Text Block */}
                <div 
                  className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border relative overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}
                >
                  {currentSection.id === 'tahlil_core' && (
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setCount(0);
                         }}
                         className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 active:rotate-180 transition-transform duration-500"
                       >
                         <RotateCcw size={14} />
                       </button>
                    </div>
                  )}

                  <div 
                    className={`font-arabic text-right leading-[2] dark:text-emerald-50 ${fontSizeClasses[fontSize]}`} 
                    dir="rtl"
                  >
                    {item.arabic}
                  </div>

                  {currentSection.id === 'tahlil_core' && (
                    <div className="mt-12 flex flex-col items-center">
                       <button 
                         onClick={incrementCount}
                         className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 overflow-hidden ${
                           isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                         } ${count >= ((currentSection as any).target || 100) ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border border-slate-100 dark:border-slate-700 shadow-inner'}`}
                       >
                          {/* Progress Circle (Simple) */}
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="60" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              className="text-emerald-500/10"
                            />
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="60" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              strokeDasharray={377}
                              strokeDashoffset={377 - (377 * (count / ((currentSection as any).target || 100)))}
                              strokeLinecap="round"
                              className="text-emerald-500 transition-all duration-300"
                            />
                          </svg>

                          <span className="text-4xl font-black text-emerald-600 relative z-10">{count}</span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest relative z-10">
                            / {(currentSection as any).target || 100}
                          </span>
                          <div className="absolute bottom-2 opacity-20">
                             <Fingerprint size={20} className="text-slate-400" />
                          </div>
                          
                          {count >= ((currentSection as any).target || 100) && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[2px]"
                            >
                               <CheckCircle2 size={40} className="text-emerald-600" />
                            </motion.div>
                          )}
                       </button>
                       <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Ketuk untuk menghitung</p>
                    </div>
                  )}
                </div>

                {/* Latin & Translation */}
                <div className="grid gap-4">
                   {showLatin && (
                     <div className={`p-6 rounded-3xl border-l-[6px] border-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Teks Latin</span>
                        </div>
                        <p className="text-base font-bold leading-relaxed italic text-slate-700 dark:text-slate-300">
                          {item.latin}
                        </p>
                     </div>
                   )}
                   {showTranslation && (
                     <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-slate-900/50 border border-slate-800' : 'bg-white border border-slate-100 shadow-sm'}`}>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artinya</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                          {item.translation}
                        </p>
                     </div>
                   )}
                </div>
             </div>
           ))}
        </motion.div>
      </main>

      {/* Navigation Controls */}
      <footer className={`fixed bottom-0 inset-x-0 p-4 pb-8 z-40 backdrop-blur-lg flex justify-center gap-4 ${isDarkMode ? 'bg-slate-950/80 border-t border-slate-800' : 'bg-white/80 border-t border-slate-200'}`}>
         <div className="w-full max-w-2xl flex items-center justify-between gap-4">
            <button 
              onClick={handleBack}
              disabled={currentIndex === 0}
              className={`flex-1 py-4 rounded-[2rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                currentIndex === 0 
                  ? 'opacity-30 grayscale pointer-events-none' 
                  : isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 active:scale-95'
              }`}
            >
              <ChevronLeft size={18} /> Kembali
            </button>
            <button 
              onClick={currentIndex === totalPages - 1 ? () => navigate(-1) : handleNext}
              className="flex-[1.5] py-4 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {currentIndex === totalPages - 1 ? 'Selesai' : 'Lanjut'} 
              {currentIndex === totalPages - 1 ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
            </button>
         </div>
      </footer>

      {/* Progress Indicator */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-full backdrop-blur-sm">
         {TAHLIL_DATA.map((_, i) => (
           <div 
             key={i} 
             className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
               i === currentIndex 
                 ? 'bg-emerald-500 w-6' 
                 : i < currentIndex ? 'bg-emerald-800/50' : 'bg-slate-300 dark:bg-slate-700'
             }`} 
           />
         ))}
      </div>
    </div>
  );
};

export default TahlilScreen;
