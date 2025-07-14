
import React from 'react';

// Beautiful, responsive, accessible skeleton for Student Attendance History
const StudentAttendanceHistorySkeleton = React.memo(function StudentAttendanceHistorySkeleton() {
  return (
    <section
      className="w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl bg-background-light dark:bg-background-dark border border-gray-light shadow-md animate-pulse"
      role="status"
      aria-busy="true"
      aria-label="Loading attendance history"
    >
      {/* Table header skeleton */}
      <div className="flex mb-4">
        <div className="h-5 w-1/4 rounded bg-gray-light shimmer mr-4" />
        <div className="h-5 w-1/4 rounded bg-gray-light shimmer mr-4" />
        <div className="h-5 w-1/4 rounded bg-gray-light shimmer mr-4" />
        <div className="h-5 w-1/4 rounded bg-gray-light shimmer" />
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-4 w-1/4 rounded bg-gray-light shimmer mr-4" />
            <div className="h-4 w-1/4 rounded bg-gray-light shimmer mr-4" />
            <div className="h-4 w-1/4 rounded bg-gray-light shimmer mr-4" />
            <div className="h-4 w-1/4 rounded bg-gray-light shimmer" />
          </div>
        ))}
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

export default StudentAttendanceHistorySkeleton;
