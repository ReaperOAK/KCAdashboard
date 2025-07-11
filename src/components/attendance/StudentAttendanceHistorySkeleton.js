import React from 'react';

const StudentAttendanceHistorySkeleton = React.memo(function StudentAttendanceHistorySkeleton() {
  return (
    <div className="flex items-center justify-center h-32" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading attendance history...</div>
    </div>
  );
});

export default StudentAttendanceHistorySkeleton;
