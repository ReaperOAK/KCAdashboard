
import React from 'react';

// Accessible, beautiful, responsive skeleton for tournament table/list
const TournamentSkeleton = React.memo(function TournamentSkeleton() {
  return (
    <div
      className="w-full flex flex-col items-center py-10 animate-pulse"
      aria-busy="true"
      aria-label="Loading tournaments"
    >
      <span className="sr-only">Loading tournaments...</span>
      {/* Skeleton header */}
      <div className="h-7 w-40 sm:w-1/3 bg-gray-light rounded mb-6" />
      {/* Skeleton table/list rows */}
      <div className="w-full max-w-4xl space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center sm:items-stretch bg-background-light rounded-xl border border-gray-light shadow-md px-4 py-4 gap-3 sm:gap-0"
          >
            <div className="h-5 w-32 bg-gray-light rounded mb-2 sm:mb-0 sm:mr-4" />
            <div className="h-5 w-24 bg-gray-light rounded mb-2 sm:mb-0 sm:mr-4" />
            <div className="h-5 w-20 bg-gray-light rounded mb-2 sm:mb-0 sm:mr-4" />
            <div className="h-5 w-20 bg-gray-light rounded mb-2 sm:mb-0 sm:mr-4" />
            <div className="h-5 w-16 bg-gray-light rounded mb-2 sm:mb-0 sm:mr-4" />
            <div className="h-5 w-20 bg-gray-light rounded mb-2 sm:mb-0 sm:mr-4" />
            <div className="h-8 w-24 bg-gray-light rounded" />
          </div>
        ))}
      </div>
    </div>
  );
});

export default TournamentSkeleton;
