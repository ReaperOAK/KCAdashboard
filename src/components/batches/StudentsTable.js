import React from 'react';
/**
 * Students table for batch detail page.
 * Responsive, accessible, and uses color tokens.
 */

const StudentsTable = ({ students }) => {
  if (!students.length) return <p className="text-gray-dark">No students enrolled in this batch yet.</p>;
  return (
    <div className="overflow-x-auto ">
      <table className="min-w-full divide-y divide-gray-light" aria-label="Batch students">
        <thead className="bg-background-light">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Name</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Email</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Joined</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-light/60 transition-colors duration-200">
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-primary">{student.full_name}</span></td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-dark">{student.email}</span></td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-dark">{new Date(student.joined_at).toLocaleDateString()}</span></td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <span className={
                  student.status === 'active'
                    ? 'bg-accent text-white font-semibold text-xs px-2 py-0.5 rounded-full '
                    : 'bg-gray-light text-primary font-medium text-xs px-2 py-0.5 rounded-full '
                }>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(StudentsTable);
