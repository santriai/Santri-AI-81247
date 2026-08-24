
import React from 'react';
import { WifiOff } from 'lucide-react';

interface NoInternetScreenProps {
  onRetry: () => void;
}

const NoInternetScreen: React.FC<NoInternetScreenProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans animate-in fade-in duration-500">
      <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm relative overflow-hidden">
         <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded-full"></div>
         <WifiOff size={64} className="text-slate-400 dark:text-slate-500 relative z-10" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Koneksi Terputus
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
        Sepertinya Anda sedang offline. Periksa sambungan internet atau data seluler Anda untuk melanjutkan.
      </p>
    </div>
  );
};

export default NoInternetScreen;
