
import React from 'react';

// Beautiful, responsive, accessible skeleton for Attendance Settings
const AttendanceSettingsSkeleton = React.memo(function AttendanceSettingsSkeleton() {
  return (
    <section
      className="w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-background-light dark:bg-background-dark border border-gray-light shadow-md animate-pulse"
      role="status"
      aria-busy="true"
      aria-label="Loading attendance settings"
    >
      {/* Title skeleton */}
      <div className="h-6 w-2/3 mb-6 rounded bg-gray-light shimmer" />

      {/* Settings rows skeleton */}
      <div className="space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-1/3 rounded bg-gray-light shimmer" />
            <div className="h-6 w-12 rounded-full bg-gray-light shimmer" />
          </div>
        ))}
      </div>

      {/* Save button skeleton */}
      <div className="mt-8 flex justify-end">
        <div className="h-10 w-32 rounded-lg bg-primary/40 shimmer" />
      </div>

      {/* Shimmer animation (Tailwind + custom) */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; height: 100%; width: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: shimmer-move 1.5s infinite;
        }
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
});

export default AttendanceSettingsSkeleton;
