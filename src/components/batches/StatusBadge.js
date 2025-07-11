import React, { useMemo } from 'react';
/**
 * Status badge for batch status (active, completed, etc.)
 * Uses color tokens and is accessible.
 */
const StatusBadge = ({ status }) => {
  const badgeClass = useMemo(() => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'completed': return 'bg-gray-light text-primary';
      default: return 'bg-warning/10 text-warning';
    }
  }, [status]);
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`} aria-label={`Batch status: ${status}`} role="status">{status}</span>
  );
};
export default React.memo(StatusBadge);
