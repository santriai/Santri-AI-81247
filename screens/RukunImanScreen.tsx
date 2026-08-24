
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Library, 
  Users, 
  History,
  Workflow,
  Quote,
  Eye
} from 'lucide-react';

const RUKUN_IMAN = [
  {
    id: 1,
    title: 'Iman kepada Allah',
    arabic: 'الإِيمَانُ بِاللهِ',
    meaning: 'Meyakini dengan sepenuh hati bahwa Allah itu Ada, Maha Esa, dan memiliki Sifat-Sifat Kesempurnaan.',
    description: 'Pondasi utama dari segala keimanan. Meyakini Allah sebagai satu-satunya Pencipta, Pemilik, dan Sembahan yang berhak disembah (Tauhid).',
    icon: Sparkles,
    color: 'from-amber-400 to-orange-500',
    details: [
      'Tauhid Rububiyah (Penciptaan)',
      'Tauhid Uluhiyah (Penyembahan)',
      'Tauhid Asma wa Shifat (Nama & Sifat)'
    ]
  },
  {
    id: 2,
    title: 'Iman kepada Malaikat',
    arabic: 'الإِيمَانُ بِالْمَلَائِكَةِ',
    meaning: 'Meyakini adanya makhluk gaib ciptaan Allah yang selalu patuh dan menjalankan tugas-Nya.',
    description: 'Malaikat diciptakan dari cahaya (nur), tidak makan, tidak minum, tidak memiliki hawa nafsu, dan tidak pernah bermaksiat.',
    icon: Eye,
    color: 'from-cyan-400 to-blue-600',
    details: [
      'Jibril (Menyampaikan Wahyu)',
      'Mikail (Membagi Rezeki)',
      'Raqub & Atid (Mencatat Amal)'
    ]
  },
  {
    id: 3,
    title: 'Iman kepada Kitab-Kitab',
    arabic: 'الإِيمَانُ بِالْكُتُبِ',
    meaning: 'Meyakini bahwa Allah telah menurunkan wahyu berupa kitab kepada para Nabi.',
    description: 'Kitab-kitab Allah berisi petunjuk, hukum, dan kabar gembira bagi umat manusia di jamannya masing-masing.',
    icon: Library,
    color: 'from-emerald-400 to-teal-600',
    details: [
      'Taurat (Nabi Musa a.s.)',
      'Zabur (Nabi Daud a.s.)',
      'Injil (Nabi Isa a.s.)',
      'Al-Qur\'an (Nabi Muhammad SAW)'
    ]
  },
  {
    id: 4,
    title: 'Iman kepada Rasul-Rasul',
    arabic: 'الإِيمَانُ بِالرُّسُلِ',
    meaning: 'Meyakini bahwa Allah telah mengutus manusia pilihan untuk membimbing umat-Nya.',
    description: 'Para Rasul adalah teladan dalam akhlak dan ketaatan. Kita wajib mengimani 25 Nabi dan Rasul yang disebutkan dalam Al-Qur\'an.',
    icon: Users,
    color: 'from-indigo-400 to-purple-600',
    details: [
      'Meneladani sifat Shiddiq & Amanah',
      'Memahami tugas Tabligh & Fathonah',
      'Nabi Muhammad sebagai Khatamul Anbiya'
    ]
  },
  {
    id: 5,
    title: 'Iman kepada Hari Kiamat',
    arabic: 'الإِيمَانُ بِالْيَوْمِ الْآخِرِ',
    meaning: 'Meyakini adanya hari kehancuran dunia dan kehidupan setelah kematian (akhirat).',
    description: 'Hari di mana seluruh amal perbuatan manusia akan dihisab (dihitung) dan dibalas dengan seadil-adilnya.',
    icon: History,
    color: 'from-rose-400 to-red-600',
    details: [
      'Yaumul Hisab (Perhitungan)',
      'Yaumul Mizan (Penimbangan)',
      'Surga dan Neraka'
    ]
  },
  {
    id: 6,
    title: 'Iman kepada Qada & Qadar',
    arabic: 'الإِيمَانُ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ',
    meaning: 'Meyakini bahwa segala sesuatu terjadi atas ketetapan dan kehendak Allah SWT.',
    description: 'Qada adalah ketetapan Allah sejak zaman azali, sedangkan Qadar adalah perwujudan dari ketetapan tersebut dalam kehidupan.',
    icon: Workflow,
    color: 'from-slate-600 to-slate-800',
    details: [
      'Menerima takdir dengan sabar',
      'Berusaha (ikhtiar) secara maksimal',
      'Tawakkal (berserah diri) kepada Allah'
    ]
  }
];

const RukunImanScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-[#003366] dark:bg-slate-900 p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-50 overflow-hidden">
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
            <h1 className="text-xl font-black text-white leading-tight">Rukun Iman</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-amber-300">Inti Keyakinan Seorang Mukmin</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-6">
        <div className="space-y-4">
          {RUKUN_IMAN.map((item, index) => {
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
                        <ShieldCheck size={14} className="text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
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
          className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 p-4 opacity-10">
            <Quote size={40} className="text-indigo-400" />
          </div>
          <p className="font-arabic text-lg text-slate-800 dark:text-slate-200 mb-3" dir="rtl">
            أَنْ تُؤْمِنَ بِاللهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الْآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
            "Engkau beriman kepada Allah, malaikat-malaikat-Nya, kitab-kitab-Nya, rasul-rasul-Nya, hari akhir, dan engkau beriman kepada takdir yang baik maupun yang buruk." (HR. Muslim)
          </p>
        </motion.div>

        <div className="text-center py-4">
          <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest leading-loose">
            Kokohkan iman dalam dada <br/> untuk meraih ridha Sang Pencipta
          </p>
        </div>
      </div>
    </div>
  );
};

export default RukunImanScreen;
