import React from 'react';
import PropTypes from 'prop-types';

const AttendanceStats = React.memo(function AttendanceStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="p-4 sm:p-3 bg-success text-white rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs opacity-90">Present</div>
        <div className="text-2xl sm:text-xl font-bold">{stats.present}</div>
      </div>
      <div className="p-4 sm:p-3 bg-error text-white rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs opacity-90">Absent</div>
        <div className="text-2xl sm:text-xl font-bold">{stats.absent}</div>
      </div>
      <div className="p-4 sm:p-3 bg-warning text-white rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs opacity-90">Late</div>
        <div className="text-2xl sm:text-xl font-bold">{stats.late}</div>
      </div>
      <div className="p-4 sm:p-3 bg-accent/20 rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs text-accent">Attendance %</div>
        <div className="text-2xl sm:text-xl font-bold text-accent">{stats.attendancePercentage}%</div>
      </div>
    </div>
  );
});

AttendanceStats.propTypes = {
  stats: PropTypes.shape({
    totalClasses: PropTypes.number,
    present: PropTypes.number,
    absent: PropTypes.number,
    late: PropTypes.number,
    attendancePercentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default AttendanceStats;
