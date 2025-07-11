import React from 'react';
import ChartCard from './ChartCard';

const QuickStats = React.memo(function QuickStats({ summaryStats }) {
  return (
    <ChartCard title="Quick Stats">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Average Attendance</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.avgAttendance || 0}%</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Active Students</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.activeStudents || 0}</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Avg Quiz Score</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.avgQuizScore || 0}%</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Classes This Month</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.classesThisMonth || 0}</p>
        </div>
      </div>
    </ChartCard>
  );
});

export default QuickStats;
