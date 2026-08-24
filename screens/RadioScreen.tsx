import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Radio, Search, Play, Pause, MapPin, Signal, Headphones } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { RadioStation } from '../types';

// Curated List of Indonesian Islamic Radios (Stable Streams)
const RADIO_STATIONS: RadioStation[] = [
  { id: 'qukuning', name: 'RadioQu ', location: 'Kuningan', genre: 'Inspirasi Spirit Hati', url: 'https://ssg.streamingmurah.com:8156/stream' },
  { id: 'damu', name: 'Radio Damu', location: 'Lumajang', genre: 'Demi Al-Musthofa Kami Berdakwah', url: 'https://stream.radiodakwahmustofa.com:8724/damu' },
  { id: 'qubon', name: 'RadioQU', location: 'Cirebon', genre: 'Al-Bahjah', url: 'https://ssg.streamingmurah.com:8428/stream2' },
  { id: 'qulingga', name: 'RadioQU', location: 'Purbalingga', genre: 'Al-Bahjah', url: 'https://ssg.streamingmurah.com:8212/stream' },
  { id: 'qubor', name: 'RadioQU', location: 'Bogor', genre: 'Al-Bahjah', url: 'https://ssg.streamingmurah.com:8398/stream' },
  { id: 'qutam', name: 'RadioQU', location: 'Batam', genre: 'Al-Bahjah', url: 'https://ssg.streamingmurah.com:8364/stream' },
  { id: 'qucehsar', name: 'RadioQU', location: 'Aceh Besar', genre: 'Al-Bahjah', url: 'https://ssg.streamingmurah.com:8410/stream' },
  { id: 'qupura', name: 'RadioQU', location: 'Martapura', genre: 'Al-Bahjah', url: 'http://45.64.97.82:8426/;stream.mp3' },
  { id: 'qucehmur', name: 'RadioQU', location: 'Aceh Timur', genre: 'Al-Bahjah', url: 'https://ssg.streamingmurah.com:8412/stream' }, 
];

const RadioScreen: React.FC = () => {
  const navigate = useNavigate();
  const { playRadio, currentRadio, isPlaying, togglePlay } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = RADIO_STATIONS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-28 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center gap-3 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
          <Signal size={20} className="text-emerald-600" /> Radio Islami
        </h2>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        
        {/* Search */}
        <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari radio, kota, atau genre..." 
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-sm outline-none focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200"
            />
        </div>

        {/* Currently Playing Card */}
        {currentRadio && (
            <div className="mb-6 bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 relative overflow-hidden flex items-center justify-between animate-in slide-in-from-top-4 group">
                
                {/* Decoration Background */}
                <div className="absolute -right-6 -bottom-10 text-emerald-500/40 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <Signal size={160} />
                </div>
                
                <div className="flex items-center gap-5 relative z-10 flex-1 min-w-0">
                    {/* Text Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> LIVE
                            </span>
                        </div>
                        
                        <h3 className="font-bold text-xl leading-tight truncate drop-shadow-sm mb-0.5">{currentRadio.name}</h3>
                        
                        {/* Genre Below Name */}
                        <p className="text-sm text-emerald-100 font-medium truncate opacity-90 mb-2">{currentRadio.genre}</p>
                        
                        <p className="text-[10px] text-emerald-50 flex items-center gap-1 truncate uppercase tracking-wider font-bold bg-black/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <MapPin size={10} /> {currentRadio.location}
                        </p>
                    </div>
                </div>

                {/* Play/Pause Button */}
                <button 
                    onClick={() => togglePlay()}
                    className="relative z-10 w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0 ml-2"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        )}

        {/* List Header */}
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-sm px-1">Daftar Saluran</h3>

        {/* Radio List */}
        <div className="space-y-3">
            {filteredStations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Radio size={40} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Tidak ada radio ditemukan.</p>
                </div>
            ) : (
                filteredStations.map((station) => {
                    const isActive = currentRadio?.id === station.id;
                    return (
                        <div
                            key={station.id}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group bg-white dark:bg-slate-900 shadow-sm ${
                                isActive 
                                ? 'border-emerald-500 ring-1 ring-emerald-500 dark:border-emerald-500' 
                                : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800'
                            }`}
                        >
                            {/* Icon Placeholder */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                isActive 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500 dark:group-hover:bg-slate-800'
                            }`}>
                                {isActive && isPlaying ? <Signal size={24} className="animate-pulse" /> : <Radio size={24} />}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-base truncate mb-0.5 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {station.name}
                                </h4>
                                <p className={`text-xs font-medium truncate mb-1 ${isActive ? 'text-emerald-600/80 dark:text-emerald-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {station.genre}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                                    <MapPin size={10} /> {station.location}
                                </div>
                            </div>

                            {/* Play Button */}
                            <button
                                onClick={() => playRadio(station)}
                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                                    isActive && isPlaying
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                                    : 'bg-white border-slate-200 text-slate-300 hover:text-emerald-500 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                                }`}
                            >
                                {isActive && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                            </button>
                        </div>
                    );
                })
            )}
        </div>

      </div>
    </div>
  );
};

export default RadioScreen;