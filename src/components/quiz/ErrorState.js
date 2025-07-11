import React from 'react';

/**
 * Error state for quiz pages.
 * @param {Object} props
 * @param {string} props.error
 * @param {function} props.onBack
 */
const ErrorState = React.memo(({ error, onBack }) => (
  <div className="min-h-screen bg-background-light p-8">
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <p className="text-red-500" role="alert">{error}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
        aria-label="Back to Quizzes"
      >
        Back to Quizzes
      </button>
    </div>
  </div>
));

export default ErrorState;
