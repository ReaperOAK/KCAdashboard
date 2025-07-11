import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * BatchTableRow - Table row for a batch.
 * @param {Object} props
 * @param {Object} props.batch
 * @param {function} props.onEdit
 */
const BatchTableRow = React.memo(function BatchTableRow({ batch, onEdit }) {
  return (
    <tr>
      <td className="px-2 py-2 sm:px-4 sm:py-3">{batch.name}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3">{batch.teacher_name}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3 capitalize">{batch.level}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3">{batch.current_students}/{batch.max_students}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3"><StatusBadge status={batch.status} /></td>
      <td className="px-2 py-2 sm:px-4 sm:py-3">
        <button
          onClick={() => onEdit(batch)}
          className="text-secondary hover:text-accent mr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Edit batch ${batch.name}`}
        >
          Edit
        </button>
      </td>
    </tr>
  );
});

export default BatchTableRow;
