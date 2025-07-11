import React from 'react';
import StatusBadge from './StatusBadge';
/**
 * Batch info card for batch detail page.
 * Beautiful, responsive, and uses color tokens.
 */
const BatchInfoCard = ({ batch }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-light overflow-hidden mb-6 transition-all duration-200">
    <div className="p-6 flex justify-between items-start">
      <div>
        <p className="text-gray-dark">{batch.description || 'No description provided.'}</p>
        <div className="mt-4 space-y-2 text-sm text-gray-dark">
          <p><span className="font-semibold">Level:</span> {batch.level}</p>
          <p><span className="font-semibold">Schedule:</span> {batch.schedule}</p>
          <p><span className="font-semibold">Students:</span> {batch.student_count}/{batch.max_students}</p>
        </div>
      </div>
      <StatusBadge status={batch.status} />
    </div>
  </div>
);
export default React.memo(BatchInfoCard);
