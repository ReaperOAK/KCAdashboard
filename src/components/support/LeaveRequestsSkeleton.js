import React from 'react';

const LeaveRequestsSkeleton = React.memo(function LeaveRequestsSkeleton() {
  return (
    <div className="flex items-center justify-center h-32" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading leave requests...</div>
    </div>
  );
});

export default LeaveRequestsSkeleton;
