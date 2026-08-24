import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Tv, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component to catch and handle runtime errors in the React component tree.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  /**
   * Updates state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging purposes.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  /**
   * Resets error state and reloads the page.
   */
  private handleReload = () => {
    // Fix: Access setState method inherited from the React.Component base class
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    // Fix: Access state and props properties inherited from the React.Component base class
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 text-5xl shadow-lg border-2 border-red-300 dark:border-red-700 select-none">
            ❗
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-4 text-sm leading-relaxed">
            Terjadi kesalahan saat memuat tampilan. Silahkan klik tombol <strong>"Muat Ulang"</strong> dibawah ini.
          </p>
          {this.state.error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-6 max-w-sm text-xs font-mono text-red-600 dark:text-red-400 break-words text-left overflow-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}
          
          <button
            onClick={this.handleReload}
            className="px-8 py-3.5 bg-santri-green text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-green-900/20 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} /> Muat Ulang
          </button>
        </div>
      );
    }

    // Render children if no error has occurred
    return children;
  }
}

export default ErrorBoundary;