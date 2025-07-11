import React from 'react';

const AnalyticsSkeleton = React.memo(function AnalyticsSkeleton() {
  return (
    <div className="py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-background-light border border-gray-light p-6 rounded-xl shadow-md flex flex-col gap-4">
          <div className="h-6 w-1/3 bg-gray-light rounded" />
          <div className="h-48 bg-gray-light/50 rounded" />
        </div>
      ))}
    </div>
  );
});

export default AnalyticsSkeleton;
