import React from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext'; 
import { LanguageProvider } from './contexts/LanguageContext';
import { HashRouter as Router } from 'react-router-dom';
import AppContent from './AppContent'; 

const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider> 
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;