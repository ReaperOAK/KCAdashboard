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
    <>
      <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-text-dark whitespace-nowrap max-w-[180px] truncate" role="cell">{batch.name}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-text-dark whitespace-nowrap max-w-[140px] truncate" role="cell">{batch.teacher_name}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-text-dark capitalize whitespace-nowrap" role="cell">{batch.level}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm text-text-dark whitespace-nowrap" role="cell">{batch.current_students}/{batch.max_students}</td>
      <td className="px-2 py-2 sm:px-4 sm:py-3" role="cell"><StatusBadge status={batch.status} /></td>
      <td className="px-2 py-2 sm:px-4 sm:py-3" role="cell">
        <button
          onClick={() => onEdit(batch)}
          className="text-secondary hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 py-1 transition-colors duration-200"
          aria-label={`Edit batch ${batch.name}`}
        >
          Edit
        </button>
      </td>
    </>
  );
});

export default BatchTableRow;
