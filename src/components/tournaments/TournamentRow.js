
import React, { useMemo } from 'react';

// Status badge color mapping for design system
const getStatusBadge = status => {
  switch (status) {
    case 'upcoming':
      return 'bg-accent/10 text-accent border border-accent';
    case 'ongoing':
      return 'bg-success/10 text-success border border-success';
    case 'completed':
      return 'bg-gray-light text-primary border border-gray-light';
    default:
      return 'bg-error/10 text-error border border-error';
  }
};

// Action button config for icon, color, and a11y
const ACTIONS = [
  {
    key: 'registrations',
    label: 'Registrations',
    icon: (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 10-8 0 4 4 0 008 0z" /></svg>
    ),
    className: 'bg-accent text-white hover:bg-secondary focus:ring-accent',
    handler: (onViewRegistrations, tournament) => () => onViewRegistrations(tournament.id),
    aria: t => `View registrations for ${t.title}`,
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z" /></svg>
    ),
    className: 'bg-secondary text-white hover:bg-accent focus:ring-accent',
    handler: (onEdit, tournament) => () => onEdit(tournament),
    aria: t => `Edit ${t.title}`,
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    ),
    className: 'bg-error text-white hover:bg-error/80 focus:ring-error',
    handler: (onDelete, tournament) => () => onDelete(tournament.id),
    aria: t => `Delete ${t.title}`,
  },
];

const TournamentRow = React.memo(function TournamentRow({ tournament, onEdit, onDelete, onViewRegistrations }) {
  // Memoize status badge class for performance
  const statusClass = useMemo(() => getStatusBadge(tournament.status), [tournament.status]);

  // Responsive, accessible, beautiful row
  return (
    <tr
      className="border-t border-gray-light hover:bg-gray-light focus-within:bg-gray-light transition-all duration-200 group outline-none"
      tabIndex={0}
      aria-label={`Tournament row for ${tournament.title}`}
    >
      {/* Title */}
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-text-dark font-medium max-w-[180px] truncate" title={tournament.title}>
        {tournament.title}
      </td>
      {/* Date/Time */}
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-text-dark whitespace-nowrap">
        {new Date(tournament.date_time).toLocaleString()}
      </td>
      {/* Type */}
      <td className="py-2 px-2 sm:py-3 sm:px-4 capitalize text-text-dark whitespace-nowrap">
        {tournament.type}
      </td>
      {/* Status badge */}
      <td className="py-2 px-2 sm:py-3 sm:px-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusClass} transition-colors duration-200`}
          aria-label={`Status: ${tournament.status}`}
        >
          {tournament.status}
        </span>
      </td>
      {/* Entry Fee */}
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-text-dark whitespace-nowrap">
        {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : <span className="text-success font-semibold">Free</span>}
      </td>
      {/* Participants */}
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-text-dark whitespace-nowrap">
        <span className="font-mono">{tournament.participant_count || 0}</span>
        {tournament.max_participants ? <span className="text-gray-light">/{tournament.max_participants}</span> : ''}
      </td>
      {/* Actions */}
      <td className="py-2 px-2 sm:py-3 sm:px-4 flex flex-wrap gap-2 min-w-[180px]">
        {ACTIONS.map(action => (
          <button
            key={action.key}
            onClick={action.handler(
              action.key === 'registrations' ? onViewRegistrations : action.key === 'edit' ? onEdit : onDelete,
              tournament
            )}
            className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${action.className}`}
            aria-label={action.aria(tournament)}
            tabIndex={0}
            type="button"
          >
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </td>
    </tr>
  );
});

export default TournamentRow;
