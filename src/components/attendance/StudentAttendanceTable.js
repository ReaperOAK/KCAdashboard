import React from 'react';
import PropTypes from 'prop-types';

const StudentAttendanceTable = React.memo(function StudentAttendanceTable({ students }) {
  return (
    <div className="overflow-x-auto w-full" aria-label="Student attendance summary table">
      <table className="min-w-full divide-y divide-gray-light text-sm sm:text-xs md:text-sm">
        <thead className="bg-primary">
          <tr>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Student Name</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Batch</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Present</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Absent</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Late</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Attendance %</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-light cursor-pointer">
              <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm text-text-dark">{student.full_name}</td>
              <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm text-text-dark">{student.batch_name}</td>
              <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap"><span className="text-success font-semibold">{student.present_count}</span></td>
              <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap"><span className="text-error font-semibold">{student.absent_count}</span></td>
              <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap"><span className="text-warning font-semibold">{student.late_count}</span></td>
              <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  student.attendance_percentage >= 75 ? 'bg-success text-white' :
                  student.attendance_percentage >= 60 ? 'bg-warning text-white' :
                  'bg-error text-white'
                }`}>
                  {student.attendance_percentage}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

StudentAttendanceTable.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    full_name: PropTypes.string.isRequired,
    batch_name: PropTypes.string.isRequired,
    present_count: PropTypes.number.isRequired,
    absent_count: PropTypes.number.isRequired,
    late_count: PropTypes.number.isRequired,
    attendance_percentage: PropTypes.number.isRequired,
  })).isRequired,
};

export default StudentAttendanceTable;
