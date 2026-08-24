
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Map, 
  MapPin, 
  BookOpen, 
  Info,
  Navigation,
  CircleArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';

const GUIDE_PHASES = [
  {
    id: 'persiapan',
    title: 'Persiapan Haji & Umroh',
    icon: ShieldCheck,
    points: ['Paspor & Visa', 'Vaksinasi Meningitis', 'Manasik (Latihan)', 'Bekal Taqwa & Finansial'],
    color: 'bg-blue-500'
  }
];

const RUKUN_DATA = {
  umroh: ['Ihram', 'Thawaf', 'Sa\'i', 'Tahallul', 'Tertib'],
  haji: ['Ihram', 'Wukuf di Arafah', 'Thawaf Ifadhah', 'Sa\'i', 'Tahallul', 'Tertib']
};

const HajjUmrahScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-sky-600 dark:bg-sky-900 p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Haji & Umroh</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-sky-100">Labbaik Allahumma Labbaik</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-6">
        <AiFeatureAssistant 
          featureName="Haji & Umroh" 
          placeholder="Tanyakan tata cara tawaf, syarat wajib haji, atau tips kesehatan saat di Makkah..." 
        />
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-sky-600 mb-3 uppercase tracking-wider">Rukun Umroh</h3>
            <div className="space-y-2">
              {RUKUN_DATA.umroh.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-amber-600 mb-3 uppercase tracking-wider">Rukun Haji</h3>
            <div className="space-y-2">
              {RUKUN_DATA.haji.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
           <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest px-1">Materi & Manasik</h3>
           
           <button 
             onClick={() => navigate('/explanation', { state: { query: 'Tata cara manasik haji tamattu lengkap dengan urutan harinya' } })}
             className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group active:scale-95 transition-all"
           >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-50 dark:bg-sky-900/30 rounded-2xl text-sky-600">
                  <Navigation size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tata Cara Haji</h4>
                  <p className="text-[10px] text-slate-500">Urutan perjalanan haji hari demi hari.</p>
                </div>
              </div>
              <CircleArrowRight size={20} className="text-slate-200 group-hover:text-sky-500 transition-colors" />
           </button>

           <button 
             onClick={() => navigate('/explanation', { state: { query: 'Miqat makani bagi jamaah haji indonesia' } })}
             className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group active:scale-95 transition-all"
           >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Titik Miqat</h4>
                  <p className="text-[10px] text-slate-500">Tempat memulai niat ihram.</p>
                </div>
              </div>
              <CircleArrowRight size={20} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
           </button>
        </section>

        <div className="bg-[#fafffb] dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-3">
             <BookOpen size={16} className="text-emerald-600" />
             <h4 className="text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase italic">Doa Ihram</h4>
          </div>
          <p className="font-arabic text-xl text-slate-800 dark:text-white leading-loose text-center mb-4" dir="rtl">
            لَبَّيْكَ اللَّهُمَّ عُمْرَةً
          </p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium italic text-center">
            "Labbaikallahumma Umratan - Aku datang memenuhi panggilan-Mu ya Allah untuk berumroh."
          </p>
        </div>
      </div>
    </div>
  );
};

export default HajjUmrahScreen;
