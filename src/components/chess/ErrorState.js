import React from 'react';

// Optional: pass icon as prop for error visual cue
const ErrorState = React.memo(({ message, onReload, icon = null }) => (
  <section
    className="flex flex-col items-center justify-center min-h-80 py-8 px-4 sm:px-8 space-y-5"
    role="alert"
    aria-live="assertive"
  >
    <div className="bg-highlight border border-highlight text-white px-6 py-4 rounded-xl shadow-md text-center w-full max-w-md flex flex-col items-center transition-all duration-200">
      {icon && (
        <div className="mb-2 text-white text-3xl" aria-hidden="true">{icon}</div>
      )}
      <span className="text-lg font-semibold leading-relaxed">{message}</span>
    </div>
    {onReload && (
      <button
        type="button"
        onClick={onReload}
        className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 font-semibold text-base mt-2"
        tabIndex={0}
      >
        Reload Page
      </button>
    )}
  </section>
));

export default ErrorState;
