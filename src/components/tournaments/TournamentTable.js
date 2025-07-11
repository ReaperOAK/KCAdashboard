import React from 'react';
import TournamentRow from './TournamentRow';

const TournamentTable = React.memo(({ tournaments, onEdit, onDelete, onViewRegistrations }) => {
  const safeTournaments = Array.isArray(tournaments) ? tournaments : [];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-background-light rounded-xl border border-gray-light overflow-hidden shadow-md" aria-label="Tournaments">
        <thead className="bg-primary text-white text-sm uppercase">
          <tr>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Title</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Date & Time</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Type</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Status</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Entry Fee</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Participants</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeTournaments.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-6 text-center text-gray-dark">No tournaments found. Create one to get started.</td>
            </tr>
          ) : (
            safeTournaments.map((tournament) => (
              <TournamentRow
                key={tournament.id}
                tournament={tournament}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewRegistrations={onViewRegistrations}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default TournamentTable;
