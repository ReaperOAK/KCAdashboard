import React from 'react';

const AttendanceSkeleton = React.memo(function AttendanceSkeleton() {
  return (
    <div className="flex items-center justify-center h-64" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading attendance data...</div>
    </div>
  );
});

export default AttendanceSkeleton;
