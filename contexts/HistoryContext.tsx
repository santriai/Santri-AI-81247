
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { HistoryItem, TranslationResult, AppSettings } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode, settings: AppSettings }> = ({ children, settings }) => {
  // Fix: Renamed loading to authLoading to match AuthContextType while maintaining consistency with other components
  const { loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const isInitialLoadRef = useRef(true);

  // --- Initial Load Logic (Local Only) ---
  useEffect(() => {
    if (authLoading) return; 

    const loadHistory = () => {
      let localHistory: HistoryItem[] = [];
      
      try {
        const localHistoryRaw = localStorage.getItem('santriai_activity_history');
        localHistory = localHistoryRaw ? JSON.parse(localHistoryRaw) : [];
      } catch (e) {
        console.warn("Failed to load history from localStorage", e);
      }

      // Migrate old translation history format if it exists and new format doesn't
      if (localHistory.length === 0) {
        try {
          const oldHistoryRaw = localStorage.getItem('santriai_history');
          if (oldHistoryRaw) {
            const parsedOld: TranslationResult[] = JSON.parse(oldHistoryRaw);
            localHistory = parsedOld.map(t => ({
              id: t.id,
              type: 'translation',
              title: t.originalText,
              subtitle: t.modernTranslation,
              timestamp: t.createdAt,
              path: '/result',
              data: t
            }));
            localStorage.setItem('santriai_activity_history', JSON.stringify(localHistory));
            localStorage.removeItem('santriai_history'); 
          }
        } catch (e) {
          console.error("Failed to migrate old history", e);
        }
      }

      setHistory(localHistory);
      isInitialLoadRef.current = false;
    };

    if (isInitialLoadRef.current) { 
      loadHistory();
    }
  }, [authLoading]);

  // --- Persistent Local Storage ---
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      try {
        localStorage.setItem('santriai_activity_history', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history to localStorage", e);
      }
    }
  }, [history]);


  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      // Deduplication Logic
      const filtered = prev.filter(h => {
        if (h.type === item.type && h.title === item.title && h.path === item.path) {
            return false; 
        }
        return true;
      });
      return [item, ...filtered].slice(0, 50); // Limit to 50 items
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
        localStorage.removeItem('santriai_activity_history');
        showToast("Riwayat berhasil dihapus.", "info");
    } catch (e) {
        showToast("Gagal menghapus riwayat.", "error");
    }
  }, [showToast]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
