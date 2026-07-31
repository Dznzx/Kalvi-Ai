import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">We're sorry, but the application encountered an unexpected error.</p>
            <div className="bg-gray-50 p-4 rounded-lg text-left text-xs font-mono text-gray-600 mb-6 overflow-auto max-h-32">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-bharatStack-blue text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 w-full"
            >
              <RefreshCcw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
