
import React from 'react';
import TournamentRow from './TournamentRow';

// Beautiful, responsive, accessible tournament table
const TournamentTable = React.memo(function TournamentTable({ tournaments, onEdit, onDelete, onViewRegistrations }) {
  const safeTournaments = Array.isArray(tournaments) ? tournaments : [];
  return (
    <div className="overflow-x-auto w-full">
      <table
        className="min-w-full bg-background-light rounded-xl border border-gray-light overflow-hidden shadow-md"
        aria-label="Tournaments"
      >
        <caption className="sr-only">Tournament List</caption>
        <thead className="bg-primary text-white text-sm uppercase">
          <tr>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Title</th>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Date &amp; Time</th>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Type</th>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Status</th>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Entry Fee</th>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Participants</th>
            <th scope="col" className="py-2 px-2 sm:py-3 sm:px-4 text-left font-semibold tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeTournaments.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-dark bg-background-light">
                <div className="flex flex-col items-center justify-center gap-2 ">
                  <svg className="w-10 h-10 text-gray-light mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                  <span className="text-lg font-medium text-gray-dark">No tournaments found</span>
                  <span className="text-sm text-gray-light">Create one to get started.</span>
                </div>
              </td>
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
