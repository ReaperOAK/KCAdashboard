import React from 'react';
/**
 * Students table for batch detail page.
 * Responsive, accessible, and uses color tokens.
 */
const StudentsTable = ({ students }) => {
  if (!students.length) return <p className="text-gray-dark">No students enrolled in this batch yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-light" aria-label="Batch students">
        <thead className="bg-background-light">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Joined</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-primary">{student.full_name}</span></td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-dark">{student.email}</span></td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-dark">{new Date(student.joined_at).toLocaleDateString()}</span></td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-light text-primary'}`}>{student.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default React.memo(StudentsTable);
