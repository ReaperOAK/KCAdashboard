
import React from 'react';

/**
 * SupportSkeleton component: Shows a beautiful, accessible, responsive skeleton for support system loading.
 * Only responsibility: Display loading skeleton for support system.
 */
const SupportSkeleton = React.memo(function SupportSkeleton() {
  return (
    <div className="flex flex-col items-center w-full py-10 px-4 animate-fade-in" aria-busy="true" aria-label="Loading support system" role="status">
      <div className="w-full max-w-2xl space-y-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-32 sm:h-36 w-full rounded-2xl border border-gray-light bg-background-light dark:bg-background-dark shadow-md animate-pulse" />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-accent animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m8-8h-4M4 12H2" /></svg>
        <span className="text-base sm:text-lg text-gray-dark font-medium">Loading support system...</span>
      </div>
    </div>
  );
});

export default SupportSkeleton;
