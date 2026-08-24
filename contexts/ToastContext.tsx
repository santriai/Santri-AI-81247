import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, WifiOff } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-2 fade-in duration-300 max-w-sm w-full backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-green-100/90 border-green-200 text-green-800 dark:bg-green-900/90 dark:text-green-100 dark:border-green-800'
                : toast.type === 'error'
                ? 'bg-red-100/90 border-red-200 text-red-800 dark:bg-red-900/90 dark:text-red-100 dark:border-red-800'
                : 'bg-slate-100/90 border-slate-200 text-slate-800 dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-700'
            }`}
          >
            <div className="shrink-0">
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'warning' && <WifiOff size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};