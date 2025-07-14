
import React from 'react';

/**
 * ErrorState: Beautiful, accessible, responsive error state for quiz pages.
 */
const ErrorState = React.memo(function ErrorState({ error, onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4 bg-background-light dark:bg-background-dark w-full ">
      <div className="bg-error/10 border border-error rounded-2xl shadow-md p-6 max-w-lg w-full flex flex-col items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-14 w-14 text-error mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
        <p className="text-lg sm:text-xl text-error font-semibold mb-2 text-center" role="alert">{error}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-5 py-2 rounded-lg bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 font-semibold shadow-sm"
          aria-label="Back to Quizzes"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
});

export default ErrorState;
