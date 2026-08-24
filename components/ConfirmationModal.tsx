import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const finalConfirmLabel = confirmLabel || t('common.yes', 'Ya, Lanjutkan');
  const finalCancelLabel = cancelLabel || t('common.cancel', 'Batal');

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
          {isDestructive ? (
            <AlertTriangle className={`w-8 h-8 ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
          ) : (
            <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed px-2">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {finalCancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg transition-colors ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-red-900/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/20'
            }`}
          >
            {finalConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;