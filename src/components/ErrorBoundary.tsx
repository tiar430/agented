'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<Record<string, never>>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<Record<string, never>>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error to monitoring service if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center p-8 max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.197V7c0-1.53-1.963-2.502-3.197-2.502H6.497c-1.54 0-2.502 1.667-2.502 3.197v4.806c0 1.531 1.963 2.502 3.197 2.502h13.856c1.54 0 2.502-1.667 2.502-3.197V7c0-1.53-1.963-2.502-3.197-2.502H6.497z"
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  What happened?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {this.state.error?.message || 'An unexpected error occurred while loading the application.'}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  What can you do?
                </h2>
                <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Refresh the page and try again</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Check your internet connection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Try using a different browser</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto text-slate-800 dark:text-slate-200">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;