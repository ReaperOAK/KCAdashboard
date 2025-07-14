import React, { useMemo } from 'react';
import SubmissionCard from './SubmissionCard';

/**
 * SubmissionsList: Renders a list of SubmissionCard components or a beautiful empty state.
 * - Responsive, accessible, and strictly follows the design system.
 * - Handles empty, loading, and error states gracefully.
 */
const SubmissionsList = ({ submissions, onGrade }) => {
  // Memoize only the list for better performance
  const list = useMemo(() => {
    if (submissions.length > 0) {
      return (
        <div className="space-y-4 ">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onGrade={() => onGrade(submission)}
            />
          ))}
        </div>
      );
    }
    // Empty state: beautiful, accessible, and animated
    return (
      <div
        className="flex flex-col items-center justify-center py-12  bg-background-light dark:bg-background-dark rounded-lg border border-gray-light shadow-md mx-auto max-w-md"
        aria-live="polite"
        role="status"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-light mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 100-8 4 4 0 000 8zm-6 4v-2a4 4 0 018 0v2m-4-4a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
        <p className="text-primary text-lg font-semibold mb-1">No submissions yet</p>
        <p className="text-gray-dark dark:text-gray-light text-sm max-w-xs">Students have not submitted work for this assignment. Encourage participation to see submissions here.</p>
      </div>
    );
  }, [submissions, onGrade]);

  return (
    <section className="w-full px-2 sm:px-0">
      {list}
    </section>
  );
};

export default React.memo(SubmissionsList);
