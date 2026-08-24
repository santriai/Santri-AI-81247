
import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Lightbulb, Sparkles, Book } from 'lucide-react';

const LOADING_TIPS = [
  {
    category: "Fitur Cerdas",
    text: "AI sedang menganalisis struktur bahasa (Nahwu & Shorof) dari teks Anda.",
    icon: Sparkles
  },
  {
    category: "Panduan",
    text: "Gunakan fitur 'Bedah Kitab' untuk memahami makna gandul pesantren.",
    icon: BookOpen
  },
  {
    category: "Tahukah Anda?",
    text: "Anda dapat menyimpan hasil analisis ke 'Koleksi Tersimpan' agar bisa dibaca offline.",
    icon: Lightbulb
  },
  {
    category: "Tips Belajar",
    text: "Bandingkan terjemahan modern dengan makna gandul untuk memperkaya kosakata.",
    icon: Search
  },
  {
    category: "Fitur Baru",
    text: "Coba fitur 'Tanya AI' di menu Hadis untuk mencari dalil spesifik.",
    icon: Sparkles
  }
];

interface CustomLoaderProps {
  message?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ message }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Fade out
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
        setFade(true); // Fade in
      }, 500);
    }, 4000); // Change tip every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = LOADING_TIPS[tipIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center w-full h-full min-h-[400px]">
      
      {/* Animation Container */}
      <div className="relative mb-10">
        {/* Glowing Background Effect */}
        <div className="absolute inset-0 bg-green-200 dark:bg-green-900/30 blur-2xl rounded-full opacity-50 animate-pulse"></div>
        
        {/* Book Icon (Base) */}
        <div className="relative z-10">
           <BookOpen size={80} className="text-santri-green dark:text-santri-gold opacity-90" strokeWidth={1.5} />
        </div>

        {/* Magnifying Glass (Animating) */}
        <div className="absolute -top-4 -right-4 z-20 animate-search-move">
           <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border-2 border-amber-400">
              <Search size={32} className="text-amber-500" strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Main Loading Message */}
      <h3 className={`text-lg font-extrabold mb-6 animate-pulse ${
        message?.includes("Menyiapkan Lembaran Kitab")
          ? "text-santri-gold"
          : "text-slate-800 dark:text-slate-100"
      }`}>
        {message || "Sedang Membedah Kitab..."}
      </h3>

      {/* Rotating Tips Card */}
      <div className="max-w-xs w-full">
        <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-opacity duration-500 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
           <div className="flex items-center justify-center gap-2 mb-2 text-santri-green dark:text-santri-gold">
              <CurrentIcon size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">
                {LOADING_TIPS[tipIndex].category}
              </span>
           </div>
           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
             "{LOADING_TIPS[tipIndex].text}"
           </p>
        </div>
      </div>

    </div>
  );
};

export default CustomLoader;
