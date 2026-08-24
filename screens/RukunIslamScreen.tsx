
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  Users, 
  MapPin, 
  Calendar,
  CloudMoon,
  HandHelping,
  Quote
} from 'lucide-react';

const RUKUN_ISLAM = [
  {
    id: 1,
    title: 'Syahadat',
    arabic: 'شَهَادَةُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ',
    meaning: 'Bersaksi bahwa tidak ada Tuhan selain Allah dan Nabi Muhammad adalah utusan Allah.',
    description: 'Pernyataan iman dan tauhid sebagai pintu masuk ke dalam Islam. Syahadat mencakup keyakinan hati dan pengucapan lisan.',
    icon: Star,
    color: 'from-amber-400 to-orange-500',
    details: [
      'Pernyataan Tauhid (Lailahaillallah)',
      'Pengakuan Kenabian (Muhammad Rasulullah)',
      'Ikhlas dalam berucap dan meyakini'
    ]
  },
  {
    id: 2,
    title: 'Sholat',
    arabic: 'إِقَامُ الصَّلَاةِ',
    meaning: 'Mendirikan Sholat lima waktu dalam sehari semalam.',
    description: 'Tiang agama dan ibadah yang pertama kali dihisab. Sholat merupakan sarana komunikasi hamba dengan Penciptanya.',
    icon: MapPin,
    color: 'from-emerald-400 to-teal-600',
    details: [
      'Subuh, Dzuhur, Ashar, Maghrib, Isya',
      'Syarat sah dan rukun sholat',
      'Pentingnya sholat berjamaah'
    ]
  },
  {
    id: 3,
    title: 'Zakat',
    arabic: 'إِيتَاءُ الزَّكَاةِ',
    meaning: 'Menunaikan zakat dari harta yang dimiliki.',
    description: 'Ibadah maliyah (harta) untuk mensucikan jiwa dan harta, serta membantu kesejahteraan umat.',
    icon: HandHelping,
    color: 'from-blue-400 to-indigo-600',
    details: [
      'Zakat Fitrah (jiwa)',
      'Zakat Maal (harta)',
      '8 Golongan penerima zakat'
    ]
  },
  {
    id: 4,
    title: 'Puasa',
    arabic: 'صَوْمُ رَمَضَانَ',
    meaning: 'Melaksanakan puasa di bulan Ramadhan.',
    description: 'Menahan diri dari hal-hal yang membatalkan puasa mulai terbit fajar hingga terbenam matahari untuk meningkatkan ketakwaan.',
    icon: CloudMoon,
    color: 'from-rose-400 to-pink-600',
    details: [
      'Niat puasa Ramadhan',
      'Hal-hal yang membatalkan puasa',
      'Hikmah kesabaran dan empati'
    ]
  },
  {
    id: 5,
    title: 'Haji',
    arabic: 'حِجُّ اْلبَيْتِ لِمَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلاً',
    meaning: 'Menunaikan ibadah haji ke Baitullah bagi yang mampu.',
    description: 'Ibadah fisik dan harta yang dilakukan sekali seumur hidup bagi mereka yang memiliki kesanggupan (istitha\'ah).',
    icon: Users,
    color: 'from-slate-600 to-slate-800',
    details: [
      'Ihram, Wukuf di Arafah, Tawaf',
      'Sa\'i antara Shofa dan Marwah',
      'Mampu secara fisik, finansial, dan keamanan'
    ]
  }
];

const RukunIslamScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-[#004d00] dark:bg-santri-green-dark p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='white' stroke-width='0.5'%3E%3Crect x='35' y='35' width='30' height='30'/%3E%3Crect x='35' y='35' width='30' height='30' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}></div>
        
        <div className="flex items-center gap-4 max-w-2xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Rukun Islam</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-santri-gold">Pondasi Iman Seorang Muslim</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-6">
        <div className="space-y-4">
          {RUKUN_ISLAM.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${item.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Rukun ke-{item.id}</span>
                      <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none mt-1">{item.title}</h2>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-800">
                    <p className="font-arabic text-xl leading-loose text-slate-800 dark:text-slate-100 text-center mb-2" dir="rtl">
                      {item.arabic}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic font-medium">
                      "{item.meaning}"
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {item.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <CheckCircle2 size={14} className="text-santri-green shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hadith Quote Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-santri-gold/10 dark:bg-santri-gold/5 p-6 rounded-[2rem] border border-santri-gold/20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 p-4 opacity-10">
            <Quote size={40} className="text-santri-gold" />
          </div>
          <p className="font-arabic text-lg text-slate-800 dark:text-slate-200 mb-3" dir="rtl">
            بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَصَوْمِ رَمَضَانَ، وَحِجِّ البَيْتِ
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
            "Islam dibangun di atas lima perkara: bersaksi bahwa tidak ada Tuhan selain Allah dan Muhammad adalah utusan Allah; mendirikan sholat; menunaikan zakat; berpuasa Ramadhan; dan berhaji ke Baitullah." (HR. Bukhari & Muslim)
          </p>
        </motion.div>

        <div className="text-center py-4">
          <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-loose">
            Mari sempurnakan ibadah kita <br/> sebagai wujud syukur kepada Allah SWT
          </p>
        </div>
      </div>
    </div>
  );
};

export default RukunIslamScreen;
