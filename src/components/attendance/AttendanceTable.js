import React from 'react';
import PropTypes from 'prop-types';

const AttendanceTable = React.memo(function AttendanceTable({ attendanceData }) {
  return (
    <div className="overflow-x-auto w-full" aria-label="Attendance history table">
      <table className="min-w-full divide-y divide-gray-light text-sm sm:text-xs md:text-sm">
        <thead className="bg-primary">
          <tr>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Batch</th>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {attendanceData.map((record) => (
            <tr key={record.id}>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-text-dark">
                {new Date(record.session_date).toLocaleDateString()}
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-text-dark">
                {record.batch_name}
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  record.status === 'present' ? 'bg-success text-white' :
                  record.status === 'late' ? 'bg-warning text-white' :
                  'bg-error text-white'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-gray-500">
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
  attendanceData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    session_date: PropTypes.string.isRequired,
    batch_name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    notes: PropTypes.string,
  })).isRequired,
};

export default AttendanceTable;
