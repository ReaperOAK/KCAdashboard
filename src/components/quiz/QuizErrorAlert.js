
import React from 'react';

/**
 * QuizErrorAlert: Beautiful, accessible, responsive error alert for quiz pages.
 */
const QuizErrorAlert = React.memo(function QuizErrorAlert({ error }) {
  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 text-center bg-error border border-error rounded-2xl shadow-md flex flex-col items-center gap-2 animate-fade-in" role="alert" aria-live="assertive">
      <svg className="h-7 w-7 text-white mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
      <span className="text-base sm:text-lg font-semibold text-white">{error}</span>
    </div>
  );
});

export default QuizErrorAlert;
