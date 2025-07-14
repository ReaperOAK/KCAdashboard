
import React from 'react';

/**
 * ActivitySkeleton - Beautiful, accessible, responsive loading skeleton for activity list.
 */
const ActivitySkeleton = React.memo(function ActivitySkeleton() {
  return (
    <div
      className="w-full max-w-2xl mx-auto bg-background-light dark:bg-background-dark rounded-lg shadow-md border border-gray-light p-4 sm:p-6 animate-pulse flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading activities"
      role="status"
    >
      <div className="h-6 w-1/3 bg-gray-light rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-light rounded mb-1" />
      <div className="h-4 w-1/2 bg-gray-light rounded mb-1" />
      <div className="h-6 w-1/4 bg-gray-light rounded" />
    </div>
  );
});

export default ActivitySkeleton;
