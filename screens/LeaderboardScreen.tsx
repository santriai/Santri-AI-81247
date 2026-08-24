
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, User, Loader2, CheckCircle, Coins, Star, ShieldCheck, Zap, BookOpen, BrainCircuit, Mic, CalendarCheck, List, Check, Award, Sparkles, Flame } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { MoneyBagIcon, FrameEmojiIcon } from '../components/EmojiIcon';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { subscribeToLeaderboard, subscribeToStreakLeaderboard, getRankDetails } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardUser {
  id: string;
  displayName: string;
  photoURL: string;
  avatarUrl?: string;
  points: number;
  wasilah?: number;
  correctAnswers?: number;
  loginStreak?: number;
  level: string;
  avatarFrame?: string;
}

const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prestige' | 'istiqomah'>('prestige');

  const getUserTitle = (rankIdx: number, pointsValue: number) => {
    if (rankIdx === 0) return 'Al-Amir';
    if (rankIdx === 1) return 'Al-Wazir';
    if (rankIdx === 2) return 'Al-Mujtahid';
    return getRankDetails(pointsValue).name;
  };

  useEffect(() => {
    setLoading(true);
    const subscribeFn = activeTab === 'prestige' ? subscribeToLeaderboard : subscribeToStreakLeaderboard;
    const unsubscribe = subscribeFn((data) => {
      setUsers(data as LeaderboardUser[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeTab]);

  const TopThree = users.slice(0, 3);
  const RestList = users.slice(3);

  // Find current user rank
  const myRankIndex = users.findIndex(u => u.id === user?.uid);
  const myData = myRankIndex !== -1 ? users[myRankIndex] : null;

  const FeatureLink = ({ icon: Icon, label, color, path }: { icon: any, label: string, color: string, path: string }) => (
    <button 
      onClick={() => navigate(path)}
      className="flex flex-col items-center gap-1.5 group flex-1 min-w-0 active:scale-95 transition-transform"
    >
      <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${color} flex items-center justify-center border border-slate-200/60 dark:border-slate-800 shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 text-center leading-tight min-h-[26px] flex items-center justify-center px-0.5 break-words">
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 pb-44 relative overflow-x-hidden">

      {/* Detail Profil Dinonaktifkan Sesuai Permintaan */}
      
      {/* Decorative Background Patterns */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-purple-900/10 via-emerald-500/10 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-20 -right-20 w-72 h-72 bg-amber-400/15 rounded-full blur-[110px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-800 via-indigo-800 to-emerald-800 text-white px-4 py-4 shadow-lg border-b border-white/10">
         <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all">
                 <ArrowLeft size={24} />
              </button>
              <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                 <Trophy className="w-5 h-5 text-amber-300 animate-pulse" strokeWidth={2.5} /> Papan Peringkat Santri
              </h2>
            </div>
         </div>
      </div>

      <div className="max-w-2xl mx-auto w-full pt-6">

         {/* TAB SELECTOR */}
         <div className="mx-4 mb-6 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl flex border border-slate-200/50 dark:border-slate-800">
            <button
               onClick={() => setActiveTab('prestige')}
               className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'prestige'
                     ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                     : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
               }`}
            >
               <Star size={16} className={activeTab === 'prestige' ? "text-amber-300 fill-amber-300 animate-spin-slow" : ""} />
               Prestige (XP)
            </button>
            <button
               onClick={() => setActiveTab('istiqomah')}
               className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'istiqomah'
                     ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                     : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
               }`}
            >
               <Flame size={16} className={activeTab === 'istiqomah' ? "text-amber-300 fill-amber-300 animate-bounce" : ""} />
               Top Istiqomah (Streak)
            </button>
         </div>
         
         {loading ? (
            <div className="flex flex-col items-center justify-center py-24 px-4">
               <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-100 dark:border-emerald-900 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
               </div>
               <p className="text-slate-400 text-sm font-bold mt-6 tracking-widest uppercase">Memuat Ranking Santri...</p>
            </div>
         ) : (
            <>
               {/* PODIUM (Top 3) */}
               {TopThree.length > 0 && (
                  <div className="flex justify-center items-end gap-2.5 sm:gap-4 md:gap-6 mb-12 px-2.5 sm:px-4 w-full pt-16 mt-4 select-none">
                     
                     {/* 2nd Place (Left Pedestal) */}
                     {TopThree[1] && (
                        <div 
                           className="flex flex-col items-center w-1/3 animate-in slide-in-from-bottom-12 duration-700 delay-200 relative group transition-transform"
                        >
                           {/* Silver Spotlight Glow */}
                           <div className="absolute top-0 inset-x-0 -translate-y-12 h-32 bg-gradient-to-b from-slate-400/20 to-transparent blur-xl rounded-full opacity-80 pointer-events-none"></div>
                           
                           {/* Silver Avatar Frame Ring Container */}
                           <div className="relative z-30 flex flex-col items-center mb-1">
                              {/* Floating Silver Trophy/Badge */}
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-25 hover:scale-110 transition-transform duration-300">
                                 <div className="bg-gradient-to-br from-slate-200 via-white to-slate-400 p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                    <Medal size={14} className="text-slate-600 fill-slate-300" />
                                 </div>
                              </div>
                              
                              <div className="relative p-1 scale-100 hover:scale-[1.03] transition-all duration-300">
                                 <UserAvatar 
                                   photoURL={TopThree[1].photoURL || TopThree[1].avatarUrl}
                                   displayName={TopThree[1].displayName}
                                   points={TopThree[1].points}
                                   size="lg"
                                   className="border-none"
                                   avatarFrame={TopThree[1].avatarFrame || 'rank_2'}
                                   rankIndex={1}
                                 />
                              </div>
                           </div>

                           {/* Silver Pedestal Stand Card */}
                           <div className="w-full bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-slate-300/80 dark:border-slate-700 shadow-xl pt-6 pb-4 px-2 text-center relative z-10 overflow-hidden backdrop-blur-md min-h-[148px] flex flex-col justify-between transition-all duration-300 group-hover:translate-y-[-2px]">
                              {/* Background Rank Watermark */}
                              <div className="absolute -right-1 -bottom-4 text-slate-300/40 dark:text-slate-800/30 text-7xl font-sans font-black select-none pointer-events-none">2</div>
                              
                              <div className="space-y-1 relative z-10 flex-grow flex flex-col justify-center">
                                 <div className="inline-block bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 text-white text-[8px] sm:text-[9px] font-black px-3 py-0.5 rounded-xl uppercase tracking-widest mb-1 shadow-md w-fit mx-auto">
                                    {getUserTitle(1, TopThree[1].points)}
                                 </div>
                                 <h4 className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug px-1">
                                    {TopThree[1].displayName}
                                 </h4>
                              </div>
                              
                              <div className="mt-2.5 relative z-10">
                                 {activeTab === 'istiqomah' ? (
                                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-black text-rose-950 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/50 px-2.5 py-1 rounded-xl w-fit mx-auto border border-rose-200 dark:border-rose-800/40 shadow-inner transition-colors">
                                       <Flame size={11} className="text-rose-500 fill-rose-400 animate-pulse" />
                                       <span>{TopThree[1].loginStreak || 0} Hari</span>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-black text-slate-800 dark:text-slate-200 bg-slate-200/70 dark:bg-slate-800 px-2.5 py-1 rounded-xl w-fit mx-auto border border-slate-300/50 dark:border-slate-700/50 shadow-inner transition-colors">
                                       <Star size={11} className="text-amber-500 fill-amber-400" />
                                       <span>{(TopThree[1].points || 0).toLocaleString()} XP</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* 1st Place (Center Pedestal) */}
                     {TopThree[0] && (
                        <div 
                           className="flex flex-col items-center w-[38%] z-20 animate-in zoom-in duration-800 relative group transition-transform"
                        >
                           {/* Intense Golden Spotlight Glow */}
                           <div className="absolute top-0 inset-x-0 -translate-y-16 h-36 bg-gradient-to-b from-amber-400/30 via-yellow-400/20 to-transparent blur-2xl rounded-full opacity-90 pointer-events-none"></div>
                           
                           {/* Golden Avatar Frame Ring Container */}
                           <div className="relative z-30 flex flex-col items-center mb-1">
                              {/* Floating Golden Premium 3D Trophy */}
                              <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 hover:scale-110 transition-transform duration-300">
                                 <div className="bg-gradient-to-br from-amber-300 via-yellow-100 to-amber-500 p-2 rounded-full shadow-xl border-2 border-white dark:border-slate-800 flex items-center justify-center animate-bounce-slow text-base select-none">
                                    🏆
                                    <span className="absolute inset-0 rounded-full border-2 border-amber-300/50 animate-ping opacity-75"></span>
                                 </div>
                              </div>
                              
                               <div className="relative p-1.5 scale-100 hover:scale-[1.03] transition-all duration-300">
                                 <UserAvatar 
                                   photoURL={TopThree[0].photoURL || TopThree[0].avatarUrl}
                                   displayName={TopThree[0].displayName}
                                   points={TopThree[0].points}
                                   size="xl"
                                   className="border-none"
                                   avatarFrame={TopThree[0].avatarFrame || 'rank_1'}
                                   rankIndex={0}
                                 />
                              </div>
                           </div>

                           {/* Gold Pedestal Stand Card */}
                           <div className="w-full bg-gradient-to-b from-amber-500/15 via-amber-500/10 to-amber-500/20 dark:from-slate-900 dark:via-amber-500/15 dark:to-amber-500/20 rounded-3xl border-2 border-amber-400/70 shadow-2xl shadow-amber-500/20 pt-8 pb-5 px-2 text-center relative z-10 overflow-hidden backdrop-blur-md min-h-[178px] flex flex-col justify-between transition-all duration-300 group-hover:translate-y-[-4px]">
                              {/* Absolute shine gloss effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                              {/* Background Gold Rank Watermark */}
                              <div className="absolute -right-2 -bottom-4 text-amber-500/20 dark:text-amber-500/10 text-8xl font-sans font-black select-none pointer-events-none">1</div>
                              
                              <div className="space-y-1.5 relative z-10 flex-grow flex flex-col justify-center">
                                 <div className="inline-block bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 text-white text-[9px] font-black px-3.5 py-0.5 rounded-xl uppercase tracking-widest mb-1 shadow-md w-fit mx-auto animate-pulse">
                                    {getUserTitle(0, TopThree[0].points)}
                                 </div>
                                 <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 leading-snug px-1">
                                    {TopThree[0].displayName}
                                 </h4>
                              </div>
                              
                              <div className="mt-3 relative z-10">
                                 {activeTab === 'istiqomah' ? (
                                    <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-rose-950 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/50 px-3 py-1.5 rounded-2xl w-fit mx-auto border border-rose-200 dark:border-rose-800/40 shadow-sm transition-all scale-100 hover:scale-105 active:scale-95 animate-pulse">
                                       <Flame size={13} className="text-rose-500 fill-rose-500 animate-bounce" />
                                       <span>{TopThree[0].loginStreak || 0} Hari</span>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-amber-900 dark:text-amber-200 bg-amber-400/25 hover:bg-amber-400/35 px-3 py-1.5 rounded-2xl w-fit mx-auto border border-amber-400/40 shadow-sm transition-all scale-100 hover:scale-105 active:scale-95 animate-pulse">
                                       <Star size={13} className="text-amber-500 fill-amber-500 animate-spin-slow" />
                                       <span>{(TopThree[0].points || 0).toLocaleString()} XP</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* 3rd Place (Right Pedestal) */}
                     {TopThree[2] && (
                        <div 
                           className="flex flex-col items-center w-1/3 animate-in slide-in-from-bottom-12 duration-700 delay-400 relative group transition-transform"
                        >
                           {/* Bronze Spotlight Glow */}
                           <div className="absolute top-0 inset-x-0 -translate-y-12 h-32 bg-gradient-to-b from-orange-500/20 to-transparent blur-xl rounded-full opacity-80 pointer-events-none"></div>
                           
                           {/* Bronze Avatar Frame Ring Container */}
                           <div className="relative z-30 flex flex-col items-center mb-1">
                              {/* Floating Bronze Medal/Badge */}
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-25 hover:scale-110 transition-transform duration-300">
                                 <div className="bg-gradient-to-br from-orange-300 via-white to-orange-500 p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                    <Award size={14} className="text-orange-600 fill-orange-300" />
                                 </div>
                              </div>
                              
                               <div className="relative p-1 scale-100 hover:scale-[1.03] transition-all duration-300">
                                 <UserAvatar 
                                   photoURL={TopThree[2].photoURL || TopThree[2].avatarUrl}
                                   displayName={TopThree[2].displayName}
                                   points={TopThree[2].points}
                                   size="lg"
                                   className="border-none"
                                   avatarFrame={TopThree[2].avatarFrame || 'rank_3'}
                                   rankIndex={2}
                                 />
                              </div>
                           </div>

                           {/* Bronze Pedestal Stand Card */}
                           <div className="w-full bg-gradient-to-b from-orange-100/80 via-orange-50/60 to-orange-100 dark:from-slate-900 dark:via-orange-950/20 dark:to-slate-950 rounded-2xl border border-orange-300 dark:border-orange-800/80 shadow-xl pt-6 pb-4 px-2 text-center relative z-10 overflow-hidden backdrop-blur-md min-h-[148px] flex flex-col justify-between transition-all duration-300 group-hover:translate-y-[-2px]">
                              {/* Background Rank Watermark */}
                              <div className="absolute -right-1 -bottom-4 text-orange-400/20 dark:text-orange-900/20 text-7xl font-sans font-black select-none pointer-events-none">3</div>
                              
                              <div className="space-y-1 relative z-10 flex-grow flex flex-col justify-center">
                                 <div className="inline-block bg-gradient-to-r from-orange-500 via-orange-600 to-amber-700 text-white text-[8px] sm:text-[9px] font-black px-3 py-0.5 rounded-xl uppercase tracking-widest mb-1 shadow-md w-fit mx-auto">
                                    {getUserTitle(2, TopThree[2].points)}
                                 </div>
                                 <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug px-1">
                                    {TopThree[2].displayName}
                                 </h4>
                              </div>
                              
                              <div className="mt-2.5 relative z-10">
                                 {activeTab === 'istiqomah' ? (
                                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-black text-rose-950 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/50 px-2.5 py-1 rounded-xl w-fit mx-auto border border-rose-200 dark:border-rose-800/40 shadow-inner transition-colors">
                                       <Flame size={11} className="text-rose-500 fill-rose-400 animate-pulse" />
                                       <span>{TopThree[2].loginStreak || 0} Hari</span>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-black text-orange-900 dark:text-orange-200 bg-orange-200/60 dark:bg-orange-950/50 px-2.5 py-1 rounded-xl w-fit mx-auto border border-orange-300/50 dark:border-orange-800/40 shadow-inner transition-colors">
                                       <Star size={11} className="text-amber-500 fill-amber-400" />
                                       <span>{(TopThree[2].points || 0).toLocaleString()} XP</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* QUICK ACTION FEATURES */}
               <div className="mx-4 mb-6 p-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[1.75rem] border border-amber-200/40 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                  <div className="grid grid-cols-4 gap-2">
                     <FeatureLink 
                        icon={MoneyBagIcon} 
                        label="Santri Miliarder" 
                        color="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                        path="/quiz-game" 
                     />
                     <FeatureLink 
                        icon={BrainCircuit} 
                        label="Kuis" 
                        color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                        path={user ? "/quiz-pro" : "/quiz"} 
                     />
                     <FeatureLink 
                        icon={FrameEmojiIcon} 
                        label="Bingkai" 
                        color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                        path="/avatar-selection" 
                     />
                     <FeatureLink 
                        icon={CalendarCheck} 
                        label="Absensi" 
                        color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        path="/profile" 
                     />
                  </div>
               </div>

               {/* Ranking List */}
               <div className="px-4 mb-6">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in duration-1000 delay-500">
                  <div className="flex items-center justify-between px-3 mb-5">
                     <h3 className="font-black text-emerald-600 dark:text-emerald-400 text-[11px] uppercase tracking-[0.25em] flex items-center gap-2">
                        <List size={14} className="text-emerald-500" /> Peringkat Lanjutan
                     </h3>
                     <Trophy size={14} className="text-amber-500 dark:text-amber-400 fill-amber-500/10" />
                  </div>
                  
                   {RestList.length > 0 ? (
                      <div className="space-y-3">
                        {RestList.map((user, idx) => {
                           const rankNum = idx + 4;
                           const rankDetails = getRankDetails(user.points || 0);
                           const isElite = rankNum <= 10;
                           
                           // Determine dynamic colorful capsule border and background pill styling based on user's current milestone rank
                           const badgeColors = 
                             rankDetails.color === 'amber' ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/40' :
                             rankDetails.color === 'cyan' ? 'bg-cyan-100 text-cyan-850 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200/40' :
                             rankDetails.color === 'emerald' ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/40' :
                             rankDetails.color === 'orange' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/40' :
                             'bg-slate-150 text-slate-700 dark:bg-slate-800/80 dark:text-slate-350 border-slate-200/20';

                           return (
                              <div 
                                 key={user.id} 
                                 
                                 className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 min-h-[94px] sm:min-h-[102px] rounded-[1.75rem] border text-left relative overflow-hidden ${isElite ? 'bg-gradient-to-r from-emerald-500/5 via-white to-emerald-500/5 dark:from-emerald-950/10 dark:via-slate-900 dark:to-emerald-950/10 border-emerald-500/20 shadow-sm' : 'bg-slate-50/55 dark:bg-slate-900/45 border-slate-100 dark:border-slate-800/60'}`}
>
                                  {/* Left side Rank Badge with beautiful geometry */}
                                  <div className="shrink-0 flex items-center justify-center">
                                     <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-sans font-black text-xs sm:text-sm shadow-sm border transition-transform group-hover:scale-105 ${
                                        rankNum === 4 ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-200/40 text-amber-600 dark:text-amber-400' :
                                        rankNum === 5 ? 'bg-slate-150 dark:bg-slate-800 border-slate-200/50 text-slate-600 dark:text-slate-300' :
                                        rankNum === 6 ? 'bg-orange-100 dark:bg-orange-950/60 border-orange-200/40 text-orange-600 dark:text-orange-300' :
                                        isElite       ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100/40 text-emerald-600 dark:text-emerald-400' :
                                        'bg-slate-50 dark:bg-slate-800/40 border-slate-100/40 text-slate-400 dark:text-slate-500'
                                     }`}>
                                        #{rankNum}
                                     </div>
                                  </div>

                                  {/* Principal Info Container: Vertically stacked Rows */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                     {/* Row 1: Photo (Avatar) & Name side-by-side */}
                                     <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                                        <div className="shrink-0">
                                           <UserAvatar 
                                             photoURL={user.photoURL || user.avatarUrl}
                                             displayName={user.displayName}
                                             points={user.points}
                                             size="md"
                                             avatarFrame={user.avatarFrame}
                                             rankIndex={rankNum - 1}
                                           />
                                        </div>
                                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm md:text-base leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors whitespace-normal break-words line-clamp-1">
                                           {user.displayName}
                                        </h4>
                                     </div>

                                     {/* Row 2: Title & XP Points side-by-side, perfectly aligned below Avatar and Name */}
                                     <div className="flex flex-wrap items-center gap-2">
                                        {/* User title/rank rendered inside an elegant, stylish micro-pill */}
                                        <span className={`inline-flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${badgeColors}`}>
                                           <span className="leading-none text-[9px] sm:text-[10px]">{rankDetails.icon}</span> 
                                           <span>{getUserTitle(idx + 3, user.points || 0)}</span>
                                        </span>

                                        {/* Total Score Capsule */}
                                        {activeTab === 'istiqomah' ? (
                                           <span className="inline-flex items-center gap-1 bg-rose-500/10 dark:bg-rose-500/5 px-2.5 py-1 rounded-full border border-rose-500/15 text-rose-700 dark:text-rose-400 font-extrabold text-[10px] sm:text-[11px] tracking-tight shadow-sm transition-all group-hover:scale-105">
                                              <Flame size={11} className="text-rose-500 fill-rose-450 animate-pulse" />
                                              <span>{user.loginStreak || 0} <span className="text-[8px] sm:text-[9px] font-sans font-black tracking-normal select-none opacity-85">Hari Streak</span></span>
                                           </span>
                                        ) : (
                                           <span className="inline-flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] sm:text-[11px] tracking-tight shadow-sm transition-all group-hover:scale-105">
                                              <Star size={11} className="text-amber-500 fill-amber-400 animate-pulse animate-spin-slow" />
                                              <span>{(user.points || 0).toLocaleString()} <span className="text-[8px] sm:text-[9px] font-sans font-black tracking-normal select-none opacity-85">XP</span></span>
                                           </span>
                                        )}
                                     </div>
                                  </div>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                           <Medal size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Belum ada ranking lainnya</p>
                     </div>
                  )}
                  </div>
               </div>
            </>
         )}
      </div>

      {/* Sticky My Rank Profile */}
      {myData && (
         <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-50 animate-in slide-in-from-bottom-12 duration-500 pb-[calc(0.85rem+env(safe-area-inset-bottom))]">
            <div className="max-w-2xl mx-auto flex items-center gap-3 sm:gap-4">
               <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-2xl font-black text-sm sm:text-base text-white shadow-md shrink-0 ${
                  myRankIndex < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-600 ring-2 ring-amber-100' : 'bg-slate-700'
               }`}>
                  {myRankIndex + 1}
               </div>
               <div className="shrink-0">
                  <UserAvatar 
                    photoURL={myData.photoURL || myData.avatarUrl}
                    displayName={myData.displayName}
                    points={myData.points}
                    size="sm"
                    avatarFrame={myData.avatarFrame}
                    rankIndex={myRankIndex}
                  />
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 dark:text-white text-xs sm:text-sm truncate">{myData.displayName}</h4>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5 truncate">
                     {getUserTitle(myRankIndex, myData.points || 0)}
                  </p>
               </div>
               <div className="text-right shrink-0">
                    {activeTab === 'istiqomah' ? (
                       <div className="font-black text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-end gap-1 tracking-tight">
                          <Flame size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
                          {myData.loginStreak || 0} Hari Streak
                       </div>
                    ) : (
                       <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center justify-end gap-1 tracking-tight">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          {(myData.points || 0).toLocaleString()} XP
                       </div>
                    )}
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight">Ranking Ke-{(myRankIndex + 1)}</div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default LeaderboardScreen;
