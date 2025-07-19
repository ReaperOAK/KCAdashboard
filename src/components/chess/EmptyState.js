import React from 'react';

// Optional: pass icon as prop for visual cue
const EmptyState = React.memo(({ message, actionLabel, onAction, icon = null }) => (
  <div
    className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-6 sm:p-8 max-w-md mx-auto flex flex-col items-center justify-center text-center transition-all duration-200"
    aria-live="polite"
    role="status"
  >
    {icon && (
      <div className="mb-3 text-accent text-4xl" aria-hidden="true">{icon}</div>
    )}
    <p className="mb-4 text-lg text-gray-dark font-medium leading-relaxed">{message}</p>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 font-semibold text-base mt-2"
        tabIndex={0}
      >
        {actionLabel}
      </button>
    )}
  </div>
));

export default EmptyState;
