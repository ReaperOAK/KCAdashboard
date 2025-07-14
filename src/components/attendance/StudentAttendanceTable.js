import React from 'react';
import PropTypes from 'prop-types';

// SVG icons for status columns
const PresentIcon = () => (
  <svg className="inline-block w-4 h-4 text-success mr-1 align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 11l4 4L19 7" /></svg>
);
const AbsentIcon = () => (
  <svg className="inline-block w-4 h-4 text-error mr-1 align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6" /></svg>
);
const LateIcon = () => (
  <svg className="inline-block w-4 h-4 text-warning mr-1 align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 6v4l2 2" /></svg>
);

const StudentAttendanceTable = React.memo(function StudentAttendanceTable({ students }) {
  return (
    <div className="overflow-x-auto w-full" aria-label="Student attendance summary table">
      <table className="min-w-full divide-y divide-gray-light text-sm sm:text-xs md:text-sm border border-gray-light rounded-lg shadow-sm bg-background-light">
        <thead className="bg-primary">
          <tr>
            <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Student Name</th>
            <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Batch</th>
            <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Present</th>
            <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Absent</th>
            <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Late</th>
            <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-white uppercase">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-light">No students found.</td>
            </tr>
          ) : (
            students.map((student, idx) => (
              <tr
                key={student.id}
                className={`transition-colors duration-150 focus-within:ring-2 focus-within:ring-accent outline-none ${
                  idx % 2 === 0 ? 'bg-background-light' : 'bg-white'
                } hover:bg-gray-light cursor-pointer`}
                tabIndex={0}
                aria-label={`Row for ${student.full_name}`}
              >
                <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm text-text-light font-medium">{student.full_name}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm text-text-light">{student.batch_name}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                  <span className="flex items-center text-success font-semibold" title="Present Days">
                    <PresentIcon />{student.present_count}
                  </span>
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                  <span className="flex items-center text-error font-semibold" title="Absent Days">
                    <AbsentIcon />{student.absent_count}
                  </span>
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                  <span className="flex items-center text-warning font-semibold" title="Late Days">
                    <LateIcon />{student.late_count}
                  </span>
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                      student.attendance_percentage >= 75 ? 'bg-success text-white' :
                      student.attendance_percentage >= 60 ? 'bg-warning text-white' :
                      'bg-error text-white'
                    }`}
                    aria-label={`Attendance percentage: ${student.attendance_percentage}%`}
                  >
                    {student.attendance_percentage}%
                  </span>
                </td>
              </tr>
            ))
          )}
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
