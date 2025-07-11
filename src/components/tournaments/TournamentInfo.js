import React from 'react';

const TournamentInfo = React.memo(({ tournament }) => (
  <section className="mb-6" aria-labelledby="tournament-title">
    <h1 id="tournament-title" className="text-2xl font-bold text-primary">{tournament.title} - Registrations</h1>
    <div className="mt-2 text-gray-dark">
      <p>Date: {new Date(tournament.date_time).toLocaleString()}</p>
      <p>
        Status: <span className={
          `px-2 py-1 rounded-full text-xs font-medium ` +
          (tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            tournament.status === 'ongoing' ? 'bg-success text-white' :
            'bg-gray-light text-primary')
        }>{tournament.status}</span>
      </p>
      <p>Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
    </div>
  </section>
));

export default TournamentInfo;
