
import React from 'react';

/**
 * QuizLoadingSkeleton: Beautiful, accessible, and responsive loading spinner for quizzes.
 */
const QuizLoadingSkeleton = React.memo(function QuizLoadingSkeleton() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[180px] p-6 sm:p-8 bg-background-light rounded-xl shadow border border-gray-light animate-fade-in"
      aria-busy="true"
      aria-label="Loading quizzes"
      role="status"
    >
      <span className="relative flex h-12 w-12 mb-3">
        <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-4 border-accent border-t-transparent border-b-accent" />
        <span className="sr-only">Loading...</span>
      </span>
      <p className="text-text-dark text-base font-medium">Loading quizzes...</p>
    </div>
  );
});

export default QuizLoadingSkeleton;
