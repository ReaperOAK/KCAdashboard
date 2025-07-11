import React, { useMemo } from 'react';

const TournamentRow = React.memo(({ tournament, onEdit, onDelete, onViewRegistrations }) => {
  const statusClass = useMemo(() => {
    switch (tournament.status) {
      case 'upcoming': return 'bg-accent/10 text-accent';
      case 'ongoing': return 'bg-success/10 text-success';
      case 'completed': return 'bg-gray-light text-primary';
      default: return 'bg-error/10 text-error';
    }
  }, [tournament.status]);
  return (
    <tr className="border-t border-gray-light hover:bg-gray-light focus-within:bg-gray-light transition-all duration-200" tabIndex={0}>
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-text-dark">{tournament.title}</td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 text-text-dark">{new Date(tournament.date_time).toLocaleString()}</td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 capitalize text-text-dark">{tournament.type}</td>
      <td className="py-2 px-2 sm:py-3 sm:px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>{tournament.status}</span>
      </td>
      <td className="py-2 px-2 sm:py-3 sm:px-4">{tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</td>
      <td className="py-2 px-2 sm:py-3 sm:px-4">{tournament.participant_count || 0}{tournament.max_participants ? `/${tournament.max_participants}` : ''}</td>
      <td className="py-2 px-2 sm:py-3 sm:px-4 space-x-2">
        <button
          onClick={() => onViewRegistrations(tournament.id)}
          className="px-3 py-1 bg-accent text-white rounded-md hover:bg-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={`View registrations for ${tournament.title}`}
        >
          Registrations
        </button>
        <button
          onClick={() => onEdit(tournament)}
          className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={`Edit ${tournament.title}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(tournament.id)}
          className="px-3 py-1 bg-error text-white rounded-md hover:bg-error/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error"
          aria-label={`Delete ${tournament.title}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

export default TournamentRow;
