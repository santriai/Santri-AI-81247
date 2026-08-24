
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  MapPin, 
  BookOpen, 
  Info,
  Navigation,
  Compass,
  Scroll,
  Flower2,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Search,
  X,
  Music,
  Book,
  Scale,
  Shield,
  GraduationCap,
  Heart,
  Mountain,
  Waves,
  History,
  Building
} from 'lucide-react';

const ZIARAH_LOCATIONS = [
  {
    id: 'nabi-muhammad',
    name: 'Makam Nabi Muhammad SAW',
    location: 'Madinah, Arab Saudi',
    description: 'Pusat kecintaan umat Islam di seluruh dunia.',
    history: 'Makam Rasulullah SAW sebelumnya adalah kamar Sayyidah Aisyah RA. Beliau dimakamkan di tempat di mana beliau wafat sesuai dengan hadis yang menyatakan bahwa para Nabi dimakamkan di tempat mereka meninggal dunia. Di samping beliau, dimakamkan pula dua sahabat terdekatnya: Sayyidina Abu Bakar Ash-Shiddiq dan Sayyidina Umar bin Khattab.',
    icon: Star,
    color: 'bg-emerald-500'
  },
  {
    id: 'sunan-ampel',
    name: 'Sunan Ampel (Raden Rahmat)',
    location: 'Surabaya, Jawa Timur',
    description: 'Sesepuh Wali Songo yang menyebarkan Islam di Jawa Timur.',
    history: 'Sunan Ampel (Raden Rahmat) datang ke Jawa sekitar tahun 1443. Beliau mendirikan pesantren Ampel Denta di Surabaya sebagai pusat pendidikan Islam pertama di Jawa Timur. Beliau dikenal dengan ajaran "Moh Limo" (Tidak melakukan lima hal buruk: Main, Ngombe, Maling, Madat, Madon). Beliau adalah guru dari sebagian besar Wali Songo lainnya.',
    icon: Compass,
    color: 'bg-blue-500'
  },
  {
    id: 'sunan-kalijaga',
    name: 'Sunan Kalijaga (Raden Said)',
    location: 'Demak, Jawa Tengah',
    description: 'Wali yang berdakwah melalui akulturasi budaya Islam-Jawa.',
    history: 'Raden Said atau Sunan Kalijaga adalah putra Adipati Tuban. Beliau menggunakan media seni dan budaya seperti Wayang Kulit, Gamelan, dan Tembang (seperti Lir-Ilir) untuk mengenalkan ajaran Islam secara halus kepada masyarakat. Makam beliau di Kadilangu, Demak, menjadi salah satu pusat ziarah tersibuk di Jawa Tengah.',
    icon: Music,
    color: 'bg-amber-500'
  },
  {
    id: 'sunan-gunung-jati',
    name: 'Sunan Gunung Jati',
    location: 'Cirebon, Jawa Barat',
    description: 'Ulama sekaligus sultan yang menyebarkan Islam di Jawa Barat.',
    history: 'Syarif Hidayatullah atau Sunan Gunung Jati adalah putra dari Syarif Abdullah Umdatuddin. Beliau mendirikan Kesultanan Cirebon dan menyebarkan Islam hingga ke pelosok Banten. Beliau mahir dalam urusan pemerintahan, kedokteran, dan ilmu agama, menjadikannya satu-satunya Wali Songo yang memadukan peran ulama dan raja (umara).',
    icon: Shield,
    color: 'bg-indigo-500'
  },
  {
    id: 'sunan-giri',
    name: 'Sunan Giri',
    location: 'Gresik, Jawa Timur',
    description: 'Pendiri Giri Kedaton yang dakwahnya mencapai Maluku.',
    history: 'Raden Paku atau Sunan Giri lahir dari rahim Dewi Sekardadu, putri Raja Balambangan. Beliau mendirikan pusat keagamaan di Giri Kedaton. Pengaruh dakwah Sunan Giri sangat luas, tidak hanya di Jawa tetapi hingga ke Lombok, Sulawesi, dan Maluku. Beliau juga dikenal sebagai pencipta lagu dolanan anak seperti Cublak-Cublak Suweng.',
    icon: Mountain,
    color: 'bg-rose-500'
  },
  {
    id: 'sunan-bonang',
    name: 'Sunan Bonang',
    location: 'Tuban, Jawa Timur',
    description: 'Putra Sunan Ampel, pencipta Gamelan Bonang.',
    history: 'Raden Maulana Makdum Ibrahim (Sunan Bonang) belajar agama di Malaka sebelum berdakwah di Tuban. Beliau mahir dalam ilmu tasawuf dan seni musik. Karyanya yang terkenal adalah "Suluk Wijil" dan pengembangan Gamelan Jawa untuk tujuan dakwah Islam.',
    icon: Music,
    color: 'bg-cyan-500'
  },
  {
    id: 'sunan-kudus',
    name: 'Sunan Kudus',
    location: 'Kudus, Jawa Tengah',
    description: 'Ahli fikih dan tokoh toleransi beragama.',
    history: 'Ja\'far Shadiq atau Sunan Kudus mendirikan Masjid Menara Kudus yang memiliki arsitektur unik perpaduan Hindu dan Islam. Beliau dikenal sangat menghargai penganut agama lain, salah satunya dengan larangan menyembelih sapi di Kudus demi menghormati umat Hindu, yang hingga kini tradisinya masih terjaga.',
    icon: GraduationCap,
    color: 'bg-orange-500'
  },
  {
    id: 'sunan-drajat',
    name: 'Sunan Drajat',
    location: 'Lamongan, Jawa Timur',
    description: 'Wali dengan misi sosial dan kemanusiaan.',
    history: 'Raden Qasim atau Sunan Drajat dikenal dengan ajaran "Catur Piwulang" yang menekankan pada kesejahteraan kaum miskin, anak yatim, dan orang sakit. Beliau mengajarkan bahwa kemakmuran ekonomi rakyat adalah fondasi penting dalam berdakwah.',
    icon: Heart,
    color: 'bg-red-500'
  }
];

const ZIARAH_GUIDE = [
  {
    id: 'adab',
    title: 'Adab Berziarah',
    description: 'Etika dan tata krama saat mengunjungi makam para Nabi dan Wali.',
    type: 'list',
    content: [
      'Niat lisan atau dalam hati karena Allah SWT.',
      'Mengucapkan Salam kepada ahli kubur.',
      'Melepas alas kaki (jika lokasi memungkinkan/dianjurkan).',
      'Membaca surat Al-Fatihah, Yaasin, atau Tahlil.',
      'Berdoa dengan menghadap kiblat.',
      'Tidak menciumi atau bersujud di atas makam.'
    ]
  },
  {
    id: 'doa',
    title: 'Doa-doa Ziarah',
    description: 'Kumpulan bacaan yang umum dibaca saat ziarah kubur.',
    type: 'reading',
    content: [
      {
        subtitle: 'Salam Ziarah Kubur',
        arabic: 'السَّلَامُ عَلَيْكُمْ يَا أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، أَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
        latin: 'Assalamu alaikum ya ahlad-diyari minal mu\'minina wal muslimin, wa inna in sya\'allahu bikum lahiqun, as’alullaha lana wa lakumul ‘afiyah.',
        translation: 'Semoga keselamatan tercurah kepada kalian, wahai penghuni kubur, dari orang-orang beriman dan orang-orang Islam, dan kami jika Allah menghendaki akan menyusul kalian, aku memohon afiyah kepada Allah untuk kami dan kalian.'
      },
      {
        subtitle: 'Doa Ziarah Lengkap',
        arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مَدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ',
        latin: 'Allahummaghfir lahu warhamhu wa \'afihi wa\'fu \'anhu, wa akrim nuzulahu, wa wassi\' madkhalahu, waghsilhu bil-ma\'i wats-tsalji wal-baradi.',
        translation: 'Ya Allah, ampunilah dia, berilah rahmat kepadanya, selamatkanlah dia, maafkanlah dia dan tempatkanlah di tempat yang mulia, luaskanlah kuburannya, mandikanlah dia dengan air, salju, dan es.'
      }
    ]
  },
  {
    id: 'tahlil',
    title: 'Bacaan Tahlil',
    description: 'Urutan bacaan tahlil lengkap untuk mendoakan ahli kubur.',
    type: 'reading',
    content: [
      {
        subtitle: 'Ilaa Hadhratin Nabiyyil Mushthafa (Hadiah Al-Fatihah)',
        arabic: 'إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ ... الفاتحة',
        latin: 'Ilaa hadhratin nabiyyil mushthafaa shallallaahu \'alaihi wa sallama... Al-Fatihah.',
        translation: 'Kepada yang terhormat Nabi Muhammad shallallahu \'alaihi wasallam... Al-Fatihah.'
      },
      {
        subtitle: 'Membaca Surah Ikhlas, Falaq, dan Naas',
        arabic: 'قُلْ هُوَ اللهُ أَحَدٌ... (3x), قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ..., قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
        latin: 'Qul huwallahu ahad... (3x), Qul auzu birabbil falaq..., Qul auzu birabbin naas...',
        translation: 'Katakanlah: Dia-lah Allah, Yang Maha Esa... (3x), Katakanlah: Aku berlindung kepada Tuhan Yang Menguasai subuh..., Katakanlah: Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia...'
      },
      {
        subtitle: 'Membaca Tasybih',
        arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ',
        latin: 'Subhanallah wa bihamdihi Subhanallahil adzim.',
        translation: 'Maha Suci Allah dengan segala puji bagi-Nya, Maha Suci Allah yang Maha Agung.'
      },
      {
        subtitle: 'Kalimat Tahlil (Inti)',
        arabic: 'لَا إِلَهَ إِلَّا اللهُ',
        latin: 'Laa ilaha illallah.',
        translation: 'Tiada Tuhan selain Allah.'
      }
    ]
  }
];

const ZiarahScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>('adab');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState<typeof ZIARAH_LOCATIONS[0] | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const filteredLocations = ZIARAH_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 overflow-hidden">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform flex-shrink-0">
              <ArrowLeft size={20}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-white leading-tight truncate">Wisata Religi & Ziarah</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 truncate">Meneladani Jejak Para Wali</p>
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

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-8">
        <button 
          onClick={() => navigate('/tahlil')}
          className="w-full bg-emerald-600 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-between group active:scale-95 transition-all text-white overflow-hidden relative"
        >
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z' fill='white'/%3E%3C/svg%3E")` }}></div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:rotate-6 transition-transform">
                 <Scroll size={24} />
              </div>
              <div className="text-left">
                 <h3 className="font-black text-sm uppercase tracking-widest leading-none mb-1">Mulai Tahlil Lengkap</h3>
                 <p className="text-[10px] font-bold text-emerald-100 opacity-80">Rangkaian bacaan & doa arwah</p>
              </div>
           </div>
           <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight size={18} />
           </div>
        </button>

        <section>
          <div className="flex items-center gap-2 mb-4">
             <Scroll size={20} className="text-emerald-600" />
             <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">Panduan, Doa & Tahlil</h2>
          </div>
          <div className="space-y-4">
            {ZIARAH_GUIDE.map((section, idx) => {
              const isOpen = openSection === section.id;
              return (
                <motion.div 
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <button 
                    onClick={() => toggleSection(section.id)}
                    className="w-full text-left p-5 flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white mb-1">{section.title}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{section.description}</p>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-emerald-600 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-6 pt-2 space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                          {section.type === 'list' ? (
                            (section.content as string[]).map((point, pIdx) => (
                              <motion.div 
                                key={pIdx} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: pIdx * 0.05 }}
                                className="flex gap-3"
                              >
                                <Flower2 size={12} className="text-emerald-500 mt-1 shrink-0" />
                                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{point}</span>
                              </motion.div>
                            ))
                          ) : (
                            (section.content as any[]).map((item, pIdx) => (
                              <motion.div 
                                key={pIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: pIdx * 0.1 }}
                                className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2"
                              >
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{item.subtitle}</h4>
                                <p className="text-xl font-arabic text-right leading-relaxed dark:text-white" dir="rtl">{item.arabic}</p>
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 italic">{item.latin}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.translation}</p>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
               <Compass size={20} className="text-emerald-600" />
               <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">Pencarian Tempat Ziarah</h2>
            </div>
            <div className="relative group flex-1 max-w-sm">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari nama wali atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-2 ring-emerald-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={14} /></button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             {filteredLocations.map((dest, idx) => (
               <motion.div 
                 key={dest.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => setSelectedLoc(dest)}
                 className="bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center p-4 gap-4 cursor-pointer active:scale-98 transition-transform group"
               >
                 <div className={`w-14 h-14 rounded-2xl ${dest.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-current shrink-0 transition-colors`}>
                    <dest.icon size={24} className={dest.color.replace('bg-', 'text-')} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{dest.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mb-0.5">{dest.location}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{dest.description}</p>
                 </div>
                 <ChevronDown size={14} className="text-slate-300 -rotate-90" />
               </motion.div>
             ))}
             {filteredLocations.length === 0 && (
               <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                 <Search size={32} className="mx-auto text-slate-200 mb-3" />
                 <p className="text-xs text-slate-400 font-medium">Tempat ziarah tidak ditemukan</p>
               </div>
             )}
          </div>
        </section>

        {/* Origin/History Modal */}
        <AnimatePresence>
          {selectedLoc && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-center"
              onClick={(e) => e.target === e.currentTarget && setSelectedLoc(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
              >
                <div className={`h-32 ${selectedLoc.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l4.3 13.2L47.5 17.5 34.3 21.8 30 35l-4.3-13.2L12.5 17.5l13.2-4.3L30 0z' fill='white' fill-opacity='1'/%3E%3C/svg%3E")` }}></div>
                  <button onClick={() => setSelectedLoc(null)} className="absolute top-6 right-6 p-2 bg-black/10 backdrop-blur-md rounded-full text-white hover:bg-black/20 transition-colors"><X size={20}/></button>
                </div>
                
                <div className="p-8 -mt-12 bg-white dark:bg-slate-900 rounded-t-[3rem] relative">
                  <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-6 border-4 border-white dark:border-slate-900">
                    <selectedLoc.icon size={32} className={selectedLoc.color.replace('bg-', 'text-')} />
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1 leading-tight">{selectedLoc.name}</h2>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <MapPin size={12} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{selectedLoc.location}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <History size={12} /> Asal-usul & Sejarah
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedLoc.history}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all">
                        Petunjuk Arah (Maps)
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
          <h4 className="text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase mb-3 flex items-center gap-2 italic">
            <Info size={14} /> Nasehat
          </h4>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium italic leading-relaxed">
            "Dulu aku melarang kalian berziarah kubur, sekarang berziarahlah kalian karena ziarah kubur dapat mengingatkan kalian pada akhirat." (HR. Muslim)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZiarahScreen;
