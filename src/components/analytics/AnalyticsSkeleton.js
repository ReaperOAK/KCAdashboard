
import React from 'react';

// Enhanced AnalyticsSkeleton: beautiful, responsive, accessible, and focused
const AnalyticsSkeleton = React.memo(function AnalyticsSkeleton() {
  return (
    <section
      className="w-full py-8 px-2 sm:px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading analytics"
      role="status"
    >
      {[...Array(3)].map((_, i) => (
        <article
          key={i}
          className="relative bg-background-light dark:bg-background-dark border border-gray-light dark:border-gray-dark p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col gap-6 min-h-[18rem] overflow-hidden transition-all duration-300"
          aria-label="Loading analytics card"
        >
          {/* Shimmer overlay */}
          <span className="absolute inset-0 bg-gradient-to-r from-background-light/80 via-gray-light/40 to-background-light/80 animate-[shimmer_1.5s_infinite] pointer-events-none rounded-2xl" style={{ zIndex: 1, opacity: 0.7 }} />
          {/* Card header skeleton */}
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="h-8 w-8 rounded-full bg-accent/30" />
            <div className="h-6 w-1/3 bg-primary/20 rounded" />
          </div>
          {/* Main chart skeleton */}
          <div className="h-40 w-full bg-gray-light/50 dark:bg-gray-dark/40 rounded-xl mb-2 relative z-10" />
          {/* Footer skeleton */}
          <div className="flex gap-2 mt-auto relative z-10">
            <div className="h-4 w-1/4 bg-secondary/30 rounded" />
            <div className="h-4 w-1/6 bg-accent/30 rounded" />
            <div className="h-4 w-1/5 bg-highlight/30 rounded" />
          </div>
        </article>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </section>
  );
});

export default AnalyticsSkeleton;
