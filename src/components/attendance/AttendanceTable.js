
import React from 'react';
import PropTypes from 'prop-types';

// Status icons (Lucide/Heroicons SVGs)
const statusIcons = {
  present: (
    <svg className="w-4 h-4 mr-1 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  late: (
    <svg className="w-4 h-4 mr-1 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
  ),
  absent: (
    <svg className="w-4 h-4 mr-1 text-error" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
};

const AttendanceTable = React.memo(function AttendanceTable({ attendanceData }) {
  return (
    <div className="overflow-x-auto w-full" aria-label="Attendance history table">
      <table className="min-w-full divide-y divide-gray-light text-sm sm:text-xs md:text-sm" role="table">
        <thead className="bg-primary">
          <tr>
            <th scope="col" className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
            <th scope="col" className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Batch</th>
            <th scope="col" className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            <th scope="col" className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-light">
          {attendanceData.map((record, idx) => (
            <tr
              key={record.id}
              className={`transition-all duration-150 focus-within:ring-2 focus-within:ring-accent hover:bg-gray-light ${idx % 2 === 0 ? 'bg-background-light' : 'bg-white'}`}
              tabIndex={0}
              role="row"
              aria-label={`Attendance record for ${record.session_date}`}
            >
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-text-dark" role="cell">
                {new Date(record.session_date).toLocaleDateString()}
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-text-dark" role="cell">
                {record.batch_name}
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap" role="cell">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm ${
                    record.status === 'present'
                      ? 'bg-success text-white'
                      : record.status === 'late'
                      ? 'bg-warning text-white'
                      : 'bg-error text-white'
                  }`}
                  aria-label={record.status}
                >
                  {statusIcons[record.status]}
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-gray-500" role="cell">
                {record.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

AttendanceTable.propTypes = {
  attendanceData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      session_date: PropTypes.string.isRequired,
      batch_name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      notes: PropTypes.string,
    })
  ).isRequired,
};

export default AttendanceTable;
