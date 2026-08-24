
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Megaphone, Swords, ExternalLink, MessageSquare } from 'lucide-react';

const NotificationDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = (location.state as any) || {};

  if (!message) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
              <div className="text-center">
                  <p className="text-slate-500 mb-4">Pesan tidak ditemukan.</p>
                  <button onClick={() => navigate(-1)} className="text-santri-green font-bold">Kembali</button>
              </div>
          </div>
      );
  }

  const notifType = message.type || '';
  const targetId = message.targetId || '';
  const title = (message.title || '').toLowerCase();
  const isChatNotif = notifType === 'chat' || notifType === 'chat_admin' || targetId === 'chat_admin' || title.includes('chat') || title.includes('admin');

  const handleActionClick = () => {
    if (isChatNotif) {
      navigate('/chat-admin');
    } else if (notifType.includes('versus') || /^\d{6}$/.test(targetId)) {
      navigate('/quiz-pro', { state: { initialRoomCode: targetId, initialAction: 'join' } });
    } else if (notifType === 'comment' || notifType === 'gift' || targetId) {
      navigate('/community', { state: { targetId: targetId, highlightPostId: targetId } });
    } else if (notifType.includes('referral')) {
      navigate('/profile');
    } else if (['payment', 'subscription', 'topup'].includes(notifType)) {
      navigate('/premium');
    } else {
      navigate('/community');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-md px-4 py-3.5 flex items-center gap-3 backdrop-blur border-b border-emerald-700/50 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-emerald-100 hover:bg-emerald-700/50 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-white text-lg">Detail Pesan</h2>
      </div>

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
         
         <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold mb-3">
                <Megaphone size={12} /> Info Admin
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight">
                {message.title}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Clock size={14} />
                <span>{message.date || 'Terbaru'}</span>
            </div>
         </div>

         {message.image && (
             <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                 <img src={message.image} alt="Broadcast" className="w-full h-auto object-cover" />
             </div>
         )}

         <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
             {message.message}
         </div>

         {(isChatNotif || targetId || notifType.includes('versus') || notifType === 'comment' || notifType === 'gift') && (
           <button
             onClick={handleActionClick}
             className="w-full py-4 mt-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
           >
             {isChatNotif ? (
               <>
                 <MessageSquare size={20} />
                 <span>Balas Chat Admin</span>
               </>
             ) : notifType.includes('versus') || /^\d{6}$/.test(targetId) ? (
               <>
                 <Swords size={20} />
                 <span>Masuk ke Room Versus {targetId ? `(#${targetId})` : ''}</span>
               </>
             ) : (
               <>
                 <MessageSquare size={18} />
                 <span>Buka Konten / Diskusi Terkait</span>
                 <ExternalLink size={16} />
               </>
             )}
           </button>
         )}

      </div>
    </div>
  );
};

export default NotificationDetailScreen;
