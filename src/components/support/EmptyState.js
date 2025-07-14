
import React from 'react';

/**
 * EmptyState component: Shows a beautiful, accessible, responsive empty state UI.
 * Only responsibility: Display empty state with icon and message.
 *
 * Props:
 *   - message: string (required)
 *   - icon?: ReactNode (optional, for custom icon)
 */
const EmptyState = React.memo(function EmptyState({ message, icon }) {
  return (
    <section
      className="flex flex-col items-center justify-center w-full px-4 py-16 sm:py-20 md:py-28 "
      aria-label="Empty State"
      tabIndex={-1}
    >
      <div className="flex items-center justify-center rounded-full bg-background-light dark:bg-background-dark shadow-md mb-4 h-20 w-20 sm:h-24 sm:w-24">
        {icon ? (
          <span className="text-accent text-4xl sm:text-5xl" aria-hidden="true">{icon}</span>
        ) : (
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-gray-light"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z"
            />
          </svg>
        )}
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2 text-center">
        {message}
      </h2>
      <p className="text-gray-dark text-base sm:text-lg text-center max-w-md">
        Nothing to show here yet.
      </p>
    </section>
  );
});

export default EmptyState;
