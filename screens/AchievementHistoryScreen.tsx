
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, BookOpen, Clock, Activity, CheckCircle, BrainCircuit, Trophy, Coins, Gem } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserData, subscribeToTasbihLogs } from '../services/firebase';

interface TasbihHistoryItem { 
  id: string; 
  title: string; 
  date: string; 
  target: number; 
  mode?: 'TAP' | 'VOICE'; 
}

const AchievementHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasbih' | 'tahfidz' | 'quiz'>('tasbih');
  
  // Tasbih Data
  const [tasbihLogs, setTasbihLogs] = useState<TasbihHistoryItem[]>([]);
  
  // User Stats for Quiz Summary
  const [userStats, setUserStats] = useState({ points: 0, wasilah: 0, correctAnswers: 0, level: 'Ibtidaiyah' });

  useEffect(() => {
    // 1. Load Tasbih History 
    if (user) {
        // If logged in, sync from Firebase (Realtime)
        const unsubscribe = subscribeToTasbihLogs(user.uid, (data) => {
            // Filter only VOICE mode if desired, or all modes
            const voiceLogs = data.filter(item => item.mode === 'VOICE');
            setTasbihLogs(voiceLogs as TasbihHistoryItem[]);
        });
        return () => unsubscribe();
    } else {
        // Fallback to LocalStorage for Guest
        try {
            const saved = localStorage.getItem('santriai_tasbih_history');
            if (saved) {
                const allLogs: TasbihHistoryItem[] = JSON.parse(saved);
                const voiceLogs = allLogs.filter(item => item.mode === 'VOICE');
                setTasbihLogs(voiceLogs);
            }
        } catch (e) {
            console.error("Failed to load local tasbih history", e);
        }
    }
  }, [user]);

  // 2. Load User Data for Stats (Points & Quiz)
  useEffect(() => {
    if (user) {
        const unsubscribe = subscribeToUserData(user.uid, (data) => {
            if (data) {
                setUserStats({
                    points: data.points || 0,
                    wasilah: data.wasilah || 0,
                    correctAnswers: data.correctAnswers || 0,
                    level: data.level || 'Ibtidaiyah'
                });
            }
        });
        return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center gap-3 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500" />
          Riwayat Prestasi
        </h2>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
         
         {/* Tabs */}
         <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            <button 
              onClick={() => setActiveTab('tasbih')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'tasbih' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
               <Mic size={16} /> Tasbih Suara
            </button>
            <button 
              onClick={() => setActiveTab('tahfidz')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'tahfidz' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
               <BookOpen size={16} /> Hafalan
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'quiz' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
               <BrainCircuit size={16} /> Statistik
            </button>
          </div>

          {/* Content Area */}
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* TAB: TASBIH SUARA */}
            {activeTab === 'tasbih' && (
                <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800/50 mb-4 flex gap-3">
                        <Mic size={24} className="text-green-600 shrink-0" />
                        <div>
                            <h3 className="font-bold text-green-800 dark:text-green-300 text-sm">Log Tasbih Suara</h3>
                            <p className="text-xs text-green-700 dark:text-green-400">
                                {user ? "Riwayat tersimpan di Cloud & Lokal." : "Riwayat tersimpan di Perangkat (Lokal)."}
                            </p>
                        </div>
                    </div>

                    {tasbihLogs.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <Activity size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 text-sm">Belum ada riwayat tasbih suara.</p>
                            <button onClick={() => navigate('/tasbih')} className="mt-4 text-green-600 font-bold text-sm hover:underline">Mulai Sekarang</button>
                        </div>
                    ) : (
                        tasbihLogs.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                                        {item.title} 
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Suara</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                        <Clock size={10} /> {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{item.target}x</span>
                                    <p className="text-[10px] text-slate-400">Bacaan Benar</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: HAFALAN (TAHFIDZ) */}
            {activeTab === 'tahfidz' && (
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 flex gap-3">
                        <BookOpen size={24} className="text-blue-600 shrink-0" />
                        <div>
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Progres Hafalan</h3>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Setoran hafalan yang diverifikasi (+50 Poin/Ayat).</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Lihat Detail Hafalan</h3>
                        <p className="text-slate-500 text-sm mb-6">Detail ayat yang sudah dihafal tersimpan di menu Tahfidz Tracker.</p>
                        <button 
                            onClick={() => navigate('/tahfidz')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors w-full"
                        >
                            Buka Tahfidz Tracker
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: STATISTIK (QUIZ) */}
            {activeTab === 'quiz' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-cyan-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center mb-4">
                            <Gem size={40} className="text-cyan-600 dark:text-cyan-400 fill-cyan-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{userStats.wasilah}</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Total Wasilah Terkumpul</p>
                        
                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-xs text-slate-400 block mb-1">Level Saat Ini</span>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{userStats.level}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-xs text-slate-400 block mb-1">Total Poin</span>
                                <span className="text-sm font-bold text-amber-500">{userStats.points.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-center text-slate-400">
                        * Wasilah dihitung dari akumulasi Cerdas Cermat, Tahfidz, Tasbih Suara, dan Absensi Harian.
                    </div>
                </div>
            )}

         </div>
      </div>
    </div>
  );
};

export default AchievementHistoryScreen;
