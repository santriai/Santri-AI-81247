import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WizardDatePickerProps {
  label: string;
  onDateSelect: (dateStr: string) => void;
  initialDate?: string;
}

const WizardDatePicker: React.FC<WizardDatePickerProps> = ({ label, onDateSelect, initialDate }) => {
  const [step, setStep] = useState(0); // 0: Date, 1: Month, 2: Year
  const [day, setDay] = useState(initialDate ? new Date(initialDate).getDate() : new Date().getDate());
  const [month, setMonth] = useState(initialDate ? new Date(initialDate).getMonth() : new Date().getMonth());
  const [year, setYear] = useState(initialDate ? new Date(initialDate).getFullYear() : new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleFinish = () => {
    const date = new Date(year, month, day);
    // Use ISO string but local time part
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    onDateSelect(localDate.toISOString().slice(0, 16));
    setStep(0); // Reset for next use if needed, but usually the parent will handle closing
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 2));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const steps = [
    {
      title: 'Pilih Tanggal',
      content: (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              onClick={() => { setDay(d); nextStep(); }}
              className={`h-10 w-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${day === d ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/30'}`}
            >
              {d}
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Pilih Bulan',
      content: (
        <div className="grid grid-cols-3 gap-2">
          {months.map((m, i) => (
            <button
              key={m}
              onClick={() => { setMonth(i); nextStep(); }}
              className={`py-3 px-2 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${month === i ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100'}`}
            >
              {m}
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Pilih Tahun',
      content: (
        <div className="space-y-2">
          {years.map(y => (
            <button
              key={y}
              onClick={() => { setYear(y); }}
              className={`w-full py-4 flex items-center justify-center rounded-2xl text-sm font-black transition-all ${year === y ? 'bg-rose-600 text-white shadow-lg border-transparent' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'}`}
            >
              {y}
              {year === y && <Check size={16} className="ml-2" />}
            </button>
          ))}
          <button 
            onClick={handleFinish}
            className="w-full mt-4 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95"
          >
            Selesai & Set Tanggal
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${step === i ? 'bg-rose-500 w-8' : 'bg-slate-200 dark:bg-slate-800'}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-50 dark:border-slate-800/50">
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{steps[step].title}</h4>
        <div className="flex gap-2">
          <button 
            disabled={step === 0}
            onClick={prevStep}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl disabled:opacity-30 text-slate-400"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            disabled={step === 2}
            onClick={nextStep}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl disabled:opacity-30 text-slate-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
        <Calendar size={12} />
        <span>Terpilih: {day} {months[month]} {year}</span>
      </div>
    </div>
  );
};

export default WizardDatePicker;
