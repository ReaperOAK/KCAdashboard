
import React from 'react';

/**
 * LeaveRequestsSkeleton component: Shows a beautiful, accessible, responsive skeleton for leave requests loading.
 * Only responsibility: Display loading skeleton for leave requests.
 */
const LeaveRequestsSkeleton = React.memo(function LeaveRequestsSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-40 sm:h-48 px-4 animate-fade-in" role="status" aria-busy="true">
      <div className="w-full max-w-3xl space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-6 w-20 rounded bg-gray-light/60 animate-pulse" />
            <div className="h-6 w-32 rounded bg-gray-light/50 animate-pulse" />
            <div className="h-6 w-32 rounded bg-gray-light/40 animate-pulse" />
            <div className="h-6 w-40 rounded bg-gray-light/30 animate-pulse" />
            <div className="h-6 w-16 rounded bg-gray-light/60 animate-pulse" />
            <div className="h-6 w-24 rounded bg-gray-light/50 animate-pulse" />
            <div className="h-8 w-28 rounded bg-gray-light/40 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-accent animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m8-8h-4M4 12H2" /></svg>
        <span className="text-base sm:text-lg text-gray-dark font-medium">Loading leave requests...</span>
      </div>
    </div>
  );
});

export default LeaveRequestsSkeleton;
