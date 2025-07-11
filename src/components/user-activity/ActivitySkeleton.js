import React from 'react';

/**
 * ActivitySkeleton - Loading skeleton for activity list.
 */
const ActivitySkeleton = React.memo(function ActivitySkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading activities">
      <div className="bg-gray-light h-6 w-1/3 rounded" />
      <div className="bg-gray-light h-4 w-2/3 rounded" />
      <div className="bg-gray-light h-4 w-1/2 rounded" />
      <div className="bg-gray-light h-6 w-1/4 rounded" />
    </div>
  );
});

export default ActivitySkeleton;
