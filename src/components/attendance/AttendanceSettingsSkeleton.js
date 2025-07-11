import React from 'react';

const AttendanceSettingsSkeleton = React.memo(function AttendanceSettingsSkeleton() {
  return (
    <div className="flex items-center justify-center h-48" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading settings...</div>
    </div>
  );
});

export default AttendanceSettingsSkeleton;
