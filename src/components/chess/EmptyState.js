import React from 'react';

const EmptyState = React.memo(({ message, actionLabel, onAction }) => (
  <div className="bg-background-light p-8 rounded-lg text-center" aria-live="polite">
    <p className="mb-4 text-gray-dark">{message}</p>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {actionLabel}
      </button>
    )}
  </div>
));

export default EmptyState;
