
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Home, 
  Calendar, 
  Wallet, 
  Package, 
  Info, 
  Plus, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  FileText,
  Search,
  Bell,
  CheckCircle2,
  User as UserIcon,
  ShieldCheck,
  Share2,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PLAYSTORE_LINK } from '../constants';
import { db, auth, handleFirestoreError } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

type TabType = 'keuangan' | 'jadwal' | 'aset' | 'pengurus' | 'informasi';

interface Mosque {
  id?: string;
  name: string;
  address?: string;
  ownerId: string;
  imamJumat?: string;
  muroqi?: string;
  muadzin?: string;
  marbot?: string;
  imamTarawih?: string;
  dkmMembers?: Array<{ role: string, name: string }>;
  schedules?: Array<any>;
  finances?: Array<any>;
  assets?: Array<any>;
  createdAt?: any;
}

const MosqueManagementScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sharedId = searchParams.get('id');
  const { showToast } = useToast();
  const [activeTab, setActiveTab ] = useState<TabType>('pengurus');
  const [loading, setLoading] = useState(true);
  const [mosque, setMosque] = useState<Mosque | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Mosque>>({
    name: '',
    address: '',
    imamJumat: '',
    muroqi: '',
    muadzin: '',
    marbot: '',
    imamTarawih: '',
    dkmMembers: [],
    schedules: [],
    finances: [],
    assets: []
  });

  useEffect(() => {
    let unsubscribe: () => void;

    const loadData = async () => {
      setLoading(true);
      try {
        if (sharedId) {
          const docRef = doc(db, 'mosques', sharedId);
          unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setMosque({ id: docSnap.id, ...docSnap.data() } as Mosque);
              setFormData({ id: docSnap.id, ...docSnap.data() } as Mosque);
            } else {
              showToast('Mosque profile not found', 'error');
            }
            setLoading(false);
          }, (error) => {
            handleFirestoreError(error, 'get', `mosques/${sharedId}`);
            setLoading(false);
          });
        } else if (auth.currentUser) {
          const q = query(collection(db, 'mosques'), where('ownerId', '==', auth.currentUser.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const firstDoc = querySnapshot.docs[0];
            setMosque({ id: firstDoc.id, ...firstDoc.data() } as Mosque);
            setFormData({ id: firstDoc.id, ...firstDoc.data() } as Mosque);
          } else {
            setShowCreateModal(true);
          }
          setLoading(false);
        } else {
          showToast('Please login to manage mosque', 'info');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        showToast('Error loading data', 'error');
        setLoading(false);
      }
    };

    loadData();
    return () => unsubscribe && unsubscribe();
  }, [sharedId, auth.currentUser]);

  const handleSave = async () => {
    if (!formData.name) return showToast('Nama Masjid wajib diisi', 'error');
    
    try {
      if (mosque?.id) {
        await updateDoc(doc(db, 'mosques', mosque.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        showToast('Data berhasil diperbarui', 'success');
      } else {
        const docRef = await addDoc(collection(db, 'mosques'), {
          ...formData,
          ownerId: auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
        setMosque({ id: docRef.id, ...formData } as Mosque);
        showToast('Profil Masjid dibuat!', 'success');
      }
      setIsEditing(false);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data', 'error');
    }
  };

  const shareMosque = async () => {
    if (!mosque?.id) return;
    const url = `${window.location.origin}/#/mosque-management?id=${mosque.id}`;
    const text = `Profil Masjid: ${mosque.name}\nAlamat: ${mosque.address}\n\nMari kunjungi dan makmurkan masjid bersama Santri AI: ${url}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `Share Masjid ${mosque.name}`;
    
    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, text);
      } catch (err) {
        navigator.clipboard.writeText(url);
        showToast('Link profil masjid disalin!', 'success');
      }
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch (e) {
        navigator.clipboard.writeText(url);
        showToast('Link profil masjid disalin!', 'success');
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link profil masjid disalin!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isOwner = auth.currentUser?.uid === mosque?.ownerId;

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      {/* Header */}
      <div className="bg-emerald-700 dark:bg-emerald-900 px-6 pt-10 pb-16 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l4 12 12 4-12 4-4 12-4-12-12-4 12-4z' fill='white' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 backdrop-blur-lg rounded-2xl text-white border border-white/20 active:scale-95 transition-transform">
              <ArrowLeft size={20}/>
            </button>
            <div className="flex gap-2">
              {mosque && (
                <button onClick={shareMosque} className="p-2.5 bg-white/10 backdrop-blur-lg rounded-2xl text-white border border-white/20 active:scale-95 transition-transform">
                  <Share2 size={20}/>
                </button>
              )}
              {isOwner && (
                <button onClick={() => setIsEditing(!isEditing)} className={`p-2.5 backdrop-blur-lg rounded-2xl border border-white/20 active:scale-95 transition-transform ${isEditing ? 'bg-white text-emerald-700' : 'bg-white/10 text-white'}`}>
                  {isEditing ? <CheckCircle2 size={20}/> : <Edit2 size={20}/>}
                </button>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white leading-tight">{mosque?.name || 'Hub Management'}</h1>
          <p className="text-emerald-100/70 text-[10px] font-black uppercase tracking-[0.2em]">{mosque?.address || 'Mosque & Majelis Assets'}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-10">
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-8 sticky top-4 z-[40] overflow-x-auto no-scrollbar">
          {(['pengurus', 'keuangan', 'jadwal', 'aset', 'informasi'] as TabType[]).map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex-none px-6 py-3 flex flex-col items-center gap-1 rounded-2xl transition-all ${
                 activeTab === tab 
                   ? 'bg-emerald-600 text-white shadow-lg' 
                   : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
             >
                {tab === 'pengurus' && <Users size={16} />}
                {tab === 'keuangan' && <Wallet size={16} />}
                {tab === 'jadwal' && <Calendar size={16} />}
                {tab === 'aset' && <Package size={16} />}
                {tab === 'informasi' && <Bell size={16} />}
                <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{tab}</span>
             </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'pengurus' && (
            <motion.div key="pengurus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Imam Jumat', value: mosque?.imamJumat, key: 'imamJumat' },
                  { label: 'Muroqi', value: mosque?.muroqi, key: 'muroqi' },
                  { label: 'Muadzin', value: mosque?.muadzin, key: 'muadzin' },
                  { label: 'Marbot', value: mosque?.marbot, key: 'marbot' },
                  { label: 'Imam Tarawih', value: mosque?.imamTarawih, key: 'imamTarawih' },
                ].map((item) => (
                  <div key={item.key} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    {isEditing ? (
                      <input 
                        className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold w-full outline-none focus:ring-1 ring-emerald-500" 
                        value={formData[item.key as keyof Mosque] as string || ''} 
                        onChange={(e) => setFormData({...formData, [item.key]: e.target.value})}
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-700 dark:text-slate-100">{item.value || '-'}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Pengurus DKM</h3>
                  {isEditing && (
                    <button 
                      onClick={() => setFormData({
                        ...formData, 
                        dkmMembers: [...(formData.dkmMembers || []), { role: '', name: '' }]
                      })}
                      className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {(isEditing ? formData.dkmMembers : mosque?.dkmMembers)?.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <UserIcon size={14} />
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex gap-2">
                             <input 
                               placeholder="Jabatan"
                               className="bg-transparent border-b border-slate-200 text-[10px] font-bold w-1/3 outline-none"
                               value={m.role}
                               onChange={(e) => {
                                 const newDkm = [...(formData.dkmMembers || [])];
                                 newDkm[idx].role = e.target.value;
                                 setFormData({...formData, dkmMembers: newDkm});
                               }}
                             />
                             <input 
                               placeholder="Nama"
                               className="bg-transparent border-b border-slate-200 text-xs font-bold w-2/3 outline-none"
                               value={m.name}
                               onChange={(e) => {
                                 const newDkm = [...(formData.dkmMembers || [])];
                                 newDkm[idx].name = e.target.value;
                                 setFormData({...formData, dkmMembers: newDkm});
                               }}
                             />
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter leading-none">{m.role}</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{m.name}</p>
                          </>
                        )}
                      </div>
                      {isEditing && (
                        <button onClick={() => {
                          const newDkm = [...(formData.dkmMembers || [])];
                          newDkm.splice(idx, 1);
                          setFormData({...formData, dkmMembers: newDkm});
                        }} className="text-rose-500"><Trash2 size={14}/></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'keuangan' && (
             <motion.div key="keuangan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                   <TrendingUp className="absolute -right-4 -bottom-4 opacity-10 rotate-12" size={120} />
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Saldo Kas</p>
                   {isEditing ? (
                     <div className="flex items-center gap-2">
                       <span className="text-2xl font-black">Rp</span>
                       <input 
                        type="number"
                        className="bg-white/10 border border-white/20 rounded-xl px-2 py-1 text-2xl font-black w-full outline-none"
                        value={formData.finances?.[0]?.total || 0}
                        onChange={(e) => setFormData({...formData, finances: [{total: Number(e.target.value)}]})}
                       />
                     </div>
                   ) : (
                     <h2 className="text-3xl font-black mb-6">Rp {(mosque?.finances?.[0]?.total || 0).toLocaleString()}</h2>
                   )}
                </div>
             </motion.div>
          )}

          {activeTab === 'jadwal' && (
             <motion.div key="jadwal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                {(isEditing ? formData.schedules : mosque?.schedules)?.map((item: any, idx: number) => (
                   <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative">
                      {isEditing ? (
                        <div className="space-y-3 pt-4">
                           <div className="flex gap-2">
                             <input className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] font-bold w-1/2 outline-none" placeholder="Hari/Tanggal" value={item.date} onChange={(e) => {
                               const newSchedules = [...(formData.schedules || [])];
                               newSchedules[idx].date = e.target.value;
                               setFormData({...formData, schedules: newSchedules});
                             }}/>
                             <input className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] font-bold w-1/2 outline-none" placeholder="Waktu" value={item.time} onChange={(e) => {
                               const newSchedules = [...(formData.schedules || [])];
                               newSchedules[idx].time = e.target.value;
                               setFormData({...formData, schedules: newSchedules});
                             }}/>
                           </div>
                           <input className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs font-bold w-full outline-none" placeholder="Nama Kajian/Kegiatan" value={item.title} onChange={(e) => {
                             const newSchedules = [...(formData.schedules || [])];
                             newSchedules[idx].title = e.target.value;
                             setFormData({...formData, schedules: newSchedules});
                           }}/>
                           <div className="flex gap-2">
                             <input className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] font-bold w-1/2 outline-none" placeholder="Ustadz" value={item.ustadz} onChange={(e) => {
                               const newSchedules = [...(formData.schedules || [])];
                               newSchedules[idx].ustadz = e.target.value;
                               setFormData({...formData, schedules: newSchedules});
                             }}/>
                             <input className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] font-bold w-1/2 outline-none" placeholder="Lokasi" value={item.location} onChange={(e) => {
                               const newSchedules = [...(formData.schedules || [])];
                               newSchedules[idx].location = e.target.value;
                               setFormData({...formData, schedules: newSchedules});
                             }}/>
                           </div>
                           <button onClick={() => {
                             const newSchedules = [...(formData.schedules || [])];
                             newSchedules.splice(idx, 1);
                             setFormData({...formData, schedules: newSchedules});
                           }} className="absolute top-2 right-4 text-rose-500"><Trash2 size={16}/></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                                <Clock size={12} className="text-emerald-600" />
                                <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-tighter">{item.date} • {item.time}</span>
                            </div>
                            <button className="text-slate-300"><ChevronRight size={18} /></button>
                          </div>
                          <h4 className="text-base font-black text-slate-700 dark:text-slate-100 mb-2 leading-tight">{item.title}</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Users size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500">{item.ustadz}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500">{item.location}</span>
                            </div>
                          </div>
                        </>
                      )}
                   </div>
                ))}
                
                {isEditing && (
                  <button 
                  onClick={() => setFormData({...formData, schedules: [...(formData.schedules || []), {title: '', ustadz: '', time: '', date: '', location: ''}]})}
                  className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    <Plus size={18} /> Tambah Jadwal Baru
                  </button>
                )}
             </motion.div>
          )}

          {activeTab === 'aset' && (
             <motion.div key="aset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                {(isEditing ? formData.assets : mosque?.assets)?.map((item: any, idx: number) => (
                   <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                         <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                            <Package size={24} />
                         </div>
                         <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold w-full outline-none" placeholder="Nama Alat" value={item.name} onChange={(e) => {
                                  const newAssets = [...(formData.assets || [])];
                                  newAssets[idx].name = e.target.value;
                                  setFormData({...formData, assets: newAssets});
                                }}/>
                                <div className="flex gap-2">
                                  <input type="number" className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] font-bold w-1/2 outline-none" placeholder="Qty" value={item.qty} onChange={(e) => {
                                    const newAssets = [...(formData.assets || [])];
                                    newAssets[idx].qty = e.target.value;
                                    setFormData({...formData, assets: newAssets});
                                  }}/>
                                  <input className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-[10px] font-bold w-1/2 outline-none" placeholder="Status" value={item.status} onChange={(e) => {
                                    const newAssets = [...(formData.assets || [])];
                                    newAssets[idx].status = e.target.value;
                                    setFormData({...formData, assets: newAssets});
                                  }}/>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-100">{item.name}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jumlah: {item.qty} Unit</p>
                              </>
                            )}
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         {!isEditing && (
                           <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                              item.status === 'Baik' ? 'bg-emerald-100 text-emerald-700' : item.status?.includes('Rusak') ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                           }`}>
                              {item.status}
                           </div>
                         )}
                         {isEditing && <button onClick={() => {
                           const newAssets = [...(formData.assets || [])];
                           newAssets.splice(idx, 1);
                           setFormData({...formData, assets: newAssets});
                         }} className="text-rose-500 p-2"><Trash2 size={16}/></button>}
                      </div>
                   </div>
                ))}
                {isEditing && (
                  <button 
                  onClick={() => setFormData({...formData, assets: [...(formData.assets || []), {name: '', qty: 1, status: 'Baik'}]})}
                  className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    <Plus size={18} /> Tambah Aset Baru
                  </button>
                )}
             </motion.div>
          )}

          {activeTab === 'informasi' && (
             <motion.div key="informasi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                   <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-3xl mb-4 overflow-hidden relative group">
                      <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=60" alt="Masjid" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Informasi Utama</div>
                   </div>
                   <h3 className="text-base font-black text-slate-700 dark:text-slate-100 mb-2 leading-tight uppercase tracking-tight">Selamat Datang di Hub Manajemen {mosque?.name}!</h3>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">Gunakan platform ini untuk memantau kas, jadwal kajian, dan pengelolaan inventaris majelis secara transparan.</p>
                   {isOwner && (
                     <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl border border-sky-100 dark:border-sky-800/30 flex items-center gap-3">
                        <Share2 size={24} className="text-sky-600 shrink-0" />
                        <div>
                         <p className="text-[10px] font-black text-sky-900 dark:text-sky-200 uppercase tracking-tighter">Link Akses Publik</p>
                         <p className="text-[9px] text-sky-700 dark:text-sky-400 font-bold mb-1">Bagikan link ini ke jamaah agar mereka bisa melihat jadwal & keuangan</p>
                         <button onClick={shareMosque} className="text-[9px] font-black text-sky-800 dark:text-sky-100 underline decoration-sky-300">Salin Sekarang</button>
                        </div>
                     </div>
                   )}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Save Button */}
      {isEditing && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-50">
           <button 
             onClick={handleSave}
             className="px-10 py-4 bg-emerald-600 text-white rounded-[2rem] shadow-2xl flex items-center gap-3 active:scale-95 transition-transform"
           >
              <CheckCircle2 size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Simpan Perubahan</span>
           </button>
        </div>
      )}

      {/* Modal Buat Baru */}
      <AnimatePresence>
        {showCreateModal && !sharedId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Buat Profil Masjid</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400"><X size={24}/></button>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nama Masjid / Mushola / Majelis</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl font-bold border border-slate-100 outline-none focus:ring-2 ring-emerald-500" 
                    placeholder="Contoh: Masjid At-Taqwa"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Alamat Singkat</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl font-bold border border-slate-100 outline-none focus:ring-2 ring-emerald-500" 
                    placeholder="Contoh: Jl. Santri No. 1"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-emerald-600 text-white rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-transform"
              >
                Buat Profil Sekarang
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MosqueManagementScreen;
