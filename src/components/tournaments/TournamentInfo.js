
import React from 'react';

/**
 * TournamentInfo: Beautiful, accessible, responsive info section for tournament details.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const statusStyles = {
  upcoming: 'bg-accent/10 text-accent',
  ongoing: 'bg-success/10 text-success',
  completed: 'bg-gray-light text-primary',
};

const TournamentInfo = React.memo(function TournamentInfo({ tournament, className = '' }) {
  return (
    <section className={["mb-6 w-full", className].join(' ')} aria-labelledby="tournament-title">
      <h1 id="tournament-title" className="text-2xl sm:text-3xl font-bold text-primary mb-2 leading-tight">
        {tournament.title} <span className="text-lg sm:text-xl font-medium text-gray-dark">– Registrations</span>
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1 text-gray-dark text-base">
        <div className="flex items-center gap-2">
          {/* Calendar icon (SVG, no external dep) */}
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          <span>{new Date(tournament.date_time).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <span className={[
            'px-2 py-1 rounded-full text-xs font-medium capitalize',
            statusStyles[tournament.status] || 'bg-gray-100 text-gray-800',
          ].join(' ')}>
            {tournament.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Entry Fee:</span>
          <span className="font-semibold text-primary">{tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</span>
        </div>
      </div>
    </section>
  );
});

export default TournamentInfo;
