import React, { useMemo } from 'react';
/**
 * Status badge for batch status (active, completed, etc.)
 * Uses color tokens and is accessible.
 */

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-accent text-white font-semibold px-2 py-0.5 rounded-full text-xs ',
    icon: (
      <svg className="inline-block w-3 h-3 mr-1 -mt-0.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" /></svg>
    ),
  },
  completed: {
    label: 'Completed',
    className: 'bg-gray-light text-primary font-medium px-2 py-0.5 rounded-full text-xs ',
    icon: (
      <svg className="inline-block w-3 h-3 mr-1 -mt-0.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l4 4 6-6" /></svg>
    ),
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-light text-gray-dark font-medium px-2 py-0.5 rounded-full text-xs ',
    icon: (
      <svg className="inline-block w-3 h-3 mr-1 -mt-0.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" /></svg>
    ),
  },
  warning: {
    label: 'Warning',
    className: 'bg-warning/10 text-warning font-medium px-2 py-0.5 rounded-full text-xs ',
    icon: (
      <svg className="inline-block w-3 h-3 mr-1 -mt-0.5 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M10 2v8m0 4h.01" /></svg>
    ),
  },
};

const StatusBadge = ({ status }) => {
  const config = useMemo(() => {
    if (!status) return statusConfig.inactive;
    if (statusConfig[status]) return statusConfig[status];
    return statusConfig.warning;
  }, [status]);
  return (
    <span
      className={config.className}
      aria-label={`Batch status: ${config.label}`}
      role="status"
    >
      {config.icon}
      {config.label}
    </span>
  );
};
export default React.memo(StatusBadge);
