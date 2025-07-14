
import React from 'react';
import { FaChessPawn } from 'react-icons/fa';

/**
 * LoadingSpinner: Beautiful, accessible, responsive loading spinner for quiz pages.
 */
const LoadingSpinner = React.memo(function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4 bg-background-light dark:bg-background-dark w-full ">
      <div className="flex flex-col items-center gap-2">
        <span className="relative flex h-16 w-16">
          <span className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" aria-hidden="true"></span>
          <FaChessPawn className="absolute inset-0 m-auto text-4xl text-secondary animate-bounce" aria-hidden="true" />
        </span>
        <p className="text-lg sm:text-xl text-gray-dark dark:text-text-light font-medium mt-4" role="status" aria-live="polite">Loading quiz...</p>
      </div>
    </div>
  );
});

export default LoadingSpinner;
