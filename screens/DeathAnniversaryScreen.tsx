
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX, Calendar, Info, CheckCircle, Clock, BookOpen, Save, Trash2, History, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { v4 as uuidv4 } from 'uuid';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';

interface Milestone {
  label: string;
  days: number;
  date: Date;
  description: string;
}

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="islamic-grid-death" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-death)" />
      </svg>
    </div>
  );
};

const DeathAnniversaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addToHistory } = useHistory();
  const { user, userData } = useAuth();

  const [name, setName] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showDeathGuide, setShowDeathGuide] = useState(true);

  const calculateMilestones = () => {
    if (!deathDate) return;

    const start = new Date(deathDate);
    start.setHours(0, 0, 0, 0);

    const config = [
      { label: '3 Hari', add: 2, desc: 'Hari ke-3 sejak wafat.' },
      { label: '7 Hari', add: 6, desc: 'Hari ke-7 sejak wafat.' },
      { label: '40 Hari', add: 39, desc: 'Peringatan 40 hari.' },
      { label: '100 Hari', add: 99, desc: 'Peringatan 100 hari.' },
      { label: 'Mendhak 1 (1 Thn)', add: 354, desc: 'Haul pertama (Perkiraan Hijriyah).' },
      { label: 'Mendhak 2 (2 Thn)', add: 708, desc: 'Haul kedua (Perkiraan Hijriyah).' },
      { label: 'Nyewu (1000 Hari)', add: 999, desc: 'Peringatan 1000 hari.' },
    ];

    const results = config.map(c => {
      const d = new Date(start);
      d.setDate(start.getDate() + c.add);
      return {
        label: c.label,
        days: c.add + 1,
        date: d,
        description: c.desc
      };
    });

    setMilestones(results);

    // Save to history automatically if results exist
    if (name.trim()) {
        addToHistory({
            id: uuidv4(),
            type: 'kitab',
            title: `Peringatan: ${name}`,
            subtitle: `Wafat: ${new Date(deathDate).toLocaleDateString('id-ID')}`,
            timestamp: new Date().toISOString(),
            path: '/death-anniversary',
            data: { name, deathDate }
        });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-left">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center justify-between gap-3">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10 flex-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <UserX size={20} className="text-slate-300" />
            Kalkulator Kematian & Haul
          </h2>
        </div>

        <button 
          onClick={() => navigate('/settings')} 
          className="relative active:scale-90 transition-all flex-shrink-0 z-10"
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

      <div className="p-4 max-w-lg mx-auto space-y-6">
        
        {/* Panduan & Dalil Peringatan Kematian */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowDeathGuide(!showDeathGuide)} 
            className="w-full p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan Syar'i & Dalil Selamatan/Haul</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showDeathGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showDeathGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Tradisi Peringatan Hari Wafat (Tahlilan)</h4>
                <p>Dalam tradisi dakwah Walisongo dan pesantren, diselenggarakan kirim doa (tahlil dan shadaqah) pada hari ke-1 s.d ke-7, 40, 100, setahun (Haul), dua tahun, serta 1000 hari bagi almarhum/ah.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Sunnah/Atsar:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">1. Kirim Doa & Ampunan bagi yang Wafat:</p>
                  <p className="italic">"Dan orang-orang yang datang sesudah mereka (Muhajirin dan Ansar), mereka berdoa: Ya Tuhan kami, ampunilah kami dan saudara-saudara kami yang telah beriman lebih dahulu dari kami..."</p>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">(QS. Al-Hasyr: 10)</p>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-205/50 dark:border-slate-707/50">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">2. Amalan Sedekah atas nama Mayit:</p>
                  <p className="italic">Ibnu Abbas menceritakan bahwa seorang lelaki bertanya kepada Rasulullah: "Ibuku wafat, apakah bermanfaat jika aku bersedekah atas namanya?" Rasulullah menjawab: "Ya."</p>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">(HR. Bukhari)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Ketentuan Hitungan Santri</h4>
                <p>Hari wafat dihitung penuh sebagai hari pertama meskipun meninggal di waktu sore (sebelum Maghrib) menurut hisab qomariyah, dikarenakan pergantian hari Islam dimulai tepat sejak terbenamnya matahari.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-3 items-start">
          <Info size={20} className="text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
            Fitur ini membantu menghitung jadwal selamatan/tahlilan Almarhum/ah. 
            Dalam tradisi Santri, hari meninggal dihitung sebagai <strong>Hari Pertama</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Almarhum/ah</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ketik nama..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 transition-all text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Meninggal</label>
            <input
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 transition-all text-sm font-bold"
            />
          </div>

          <button 
            onClick={calculateMilestones} 
            disabled={!deathDate} 
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Clock size={20} /> Hitung Jadwal
          </button>
        </div>

        {milestones.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-1">
               <div className="w-1 h-5 bg-santri-gold rounded-full"></div>
               <h3 className="font-bold text-slate-800 dark:text-slate-100">Jadwal Peringatan {name && `(${name})`}</h3>
            </div>
            
            <div className="grid gap-3">
              {milestones.map((m, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs border border-slate-100 dark:border-slate-700">
                    {m.label.split(' ')[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-0.5">{m.label}</h4>
                    <p className="text-[11px] font-black text-santri-green uppercase tracking-wider">{formatDate(m.date)}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
               <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase text-amber-700 dark:text-amber-400">
                  <BookOpen size={14} /> Adab & Sunnah
               </div>
               <p className="text-[11px] italic leading-relaxed text-amber-800 dark:text-amber-200">
                  "Sampaikanlah pahala bacaan Quran, Sholawat, dan Sedekah untuk Almarhum/ah. Semoga menjadi cahaya di alam kuburnya."
               </p>
            </div>
          </div>
        )}
      </div>
      <AiFeatureAssistant 
        featureName="Pakar Kematian & Haul" 
        contextData={{ milestones, name, deathDate }} 
        placeholder="Tanyakan keutamaan mengirim doa tahlil, sedekah mayat, atau adab takziah..." 
      />
    </div>
  );
};

export default DeathAnniversaryScreen;
