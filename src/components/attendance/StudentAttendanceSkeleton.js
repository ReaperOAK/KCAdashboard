import React from 'react';

const StudentAttendanceSkeleton = React.memo(function StudentAttendanceSkeleton() {
  return (
    <div className="flex items-center justify-center h-32" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading student attendance...</div>
    </div>
  );
});

export default StudentAttendanceSkeleton;
