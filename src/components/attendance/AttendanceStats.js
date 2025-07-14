
import React from 'react';
import PropTypes from 'prop-types';

// Lucide icons (or Heroicons) via SVG for visual clarity
const icons = {
  present: (
    <svg className="w-6 h-6 text-success mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  absent: (
    <svg className="w-6 h-6 text-error mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  late: (
    <svg className="w-6 h-6 text-warning mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
  ),
  percent: (
    <svg className="w-6 h-6 text-accent mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 16l8-8" /><circle cx="9" cy="15" r="1" /><circle cx="15" cy="9" r="1" /></svg>
  ),
};

const AttendanceStats = React.memo(function AttendanceStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {/* Present */}
      <div className="group p-5 sm:p-4 bg-success text-white rounded-xl flex items-center shadow-md border border-success/70 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-within:ring-2 focus-within:ring-accent" tabIndex={0} aria-label={`Present: ${stats.present}`}> 
        {icons.present}
        <div>
          <div className="text-xs opacity-90 font-medium">Present</div>
          <div className="text-2xl font-bold leading-tight">{stats.present}</div>
        </div>
      </div>
      {/* Absent */}
      <div className="group p-5 sm:p-4 bg-error text-white rounded-xl flex items-center shadow-md border border-error/70 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-within:ring-2 focus-within:ring-accent" tabIndex={0} aria-label={`Absent: ${stats.absent}`}> 
        {icons.absent}
        <div>
          <div className="text-xs opacity-90 font-medium">Absent</div>
          <div className="text-2xl font-bold leading-tight">{stats.absent}</div>
        </div>
      </div>
      {/* Late */}
      <div className="group p-5 sm:p-4 bg-warning text-white rounded-xl flex items-center shadow-md border border-warning/70 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-within:ring-2 focus-within:ring-accent" tabIndex={0} aria-label={`Late: ${stats.late}`}> 
        {icons.late}
        <div>
          <div className="text-xs opacity-90 font-medium">Late</div>
          <div className="text-2xl font-bold leading-tight">{stats.late}</div>
        </div>
      </div>
      {/* Attendance % */}
      <div className="group p-5 sm:p-4 bg-accent/10 rounded-xl flex items-center shadow-md border border-accent/30 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-within:ring-2 focus-within:ring-accent" tabIndex={0} aria-label={`Attendance Percentage: ${stats.attendancePercentage}%`}>
        {icons.percent}
        <div>
          <div className="text-xs text-accent font-medium">Attendance %</div>
          <div className="text-2xl font-bold leading-tight text-accent">{stats.attendancePercentage}%</div>
        </div>
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
