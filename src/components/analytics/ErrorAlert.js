import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Enhanced ErrorAlert: beautiful, responsive, accessible, and focused
const ErrorAlert = React.memo(function ErrorAlert({ error, onRetry }) {
  return (
    <section
      className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl shadow-md border-l-4 border-highlight bg-highlight/10 dark:bg-highlight/20 mb-6 transition-all duration-300"
      role="alert"
      aria-live="assertive"
      tabIndex={0}
    >
      {/* Icon with accent background */}
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-highlight/20 text-highlight mr-2 shrink-0">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <header className="mb-1">
          <h3 className="text-lg font-semibold text-highlight">Error Loading Analytics</h3>
        </header>
        <div className="text-highlight text-base break-words">
          <p>{error}</p>
        </div>
        <p className="text-sm text-highlight/80 mt-1">Please check your internet connection and try again.</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 sm:mt-0 sm:ml-4 px-4 py-2 bg-accent text-white rounded-lg font-medium shadow hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200"
      >
        Retry
      </button>
    </section>
  );
});

export default ErrorAlert;
