
import React from 'react';
import RegistrationButton from './RegistrationButton';

/**
 * TournamentCard: Beautiful, accessible, responsive card for tournament details and actions.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const statusStyles = {
  upcoming: 'bg-accent/10 text-accent',
  ongoing: 'bg-success/10 text-success',
  completed: 'bg-gray-light text-gray-dark',
};

// SVG icons (no external dep, for best performance)
const CalendarIcon = (
  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
const MapPinIcon = (
  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-9a8 8 0 1 1 16 0c0 3.627-3.582 9-8 9z" /><circle cx="12" cy="12" r="3" /></svg>
);
const TrophyIcon = (
  <svg className="w-4 h-4 text-highlight" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M17 5V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2M21 5h-3v2a7 7 0 1 1-10 0V5H3" /></svg>
);
const UsersIcon = (
  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM23 20v-2a4 4 0 0 0-3-3.87" /></svg>
);
const UserIcon = (
  <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
);

const TournamentCard = React.memo(function TournamentCard({ tournament, registrationStatus, onRegister, onCancel, loading, className = '' }) {
  return (
    <div className={["bg-background-light dark:bg-background-dark rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-light transition-all duration-200 hover:shadow-xl group", className].join(' ')}>
      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-primary group-hover:text-accent transition-colors duration-200 line-clamp-2" title={tournament.title}>{tournament.title}</h3>
          <span className={["px-3 py-1 rounded-full text-xs font-semibold capitalize", statusStyles[tournament.status] || 'bg-gray-100 text-gray-800'].join(' ')}>{tournament.status}</span>
        </div>
        <p className="text-gray-dark mb-2 line-clamp-3 text-sm sm:text-base">{tournament.description}</p>
        <div className="space-y-1 text-sm text-gray-dark">
          <p className="flex items-center gap-2">{CalendarIcon} {new Date(tournament.date_time).toLocaleString()}</p>
          <p className="flex items-center gap-2">{MapPinIcon} {tournament.location || 'Online'}</p>
          <p className="flex items-center gap-2"><span className="font-semibold">💰</span> Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
          <p className="flex items-center gap-2">{TrophyIcon} Prize Pool: ₹{tournament.prize_pool}</p>
          <p className="flex items-center gap-2">{UsersIcon} Participants: {tournament.participant_count || 0}{tournament.max_participants ? ` / ${tournament.max_participants}` : ''}</p>
          <p className="flex items-center gap-2">{UserIcon} Organizer: {tournament.organizer_name}</p>
        </div>
      </div>
      <div className="px-5 sm:px-6 py-4 bg-gray-light border-t flex flex-col gap-2">
        {tournament.status === 'upcoming' && (
          <RegistrationButton
            tournament={tournament}
            registrationStatus={registrationStatus}
            onRegister={onRegister}
            onCancel={onCancel}
            loading={loading}
          />
        )}
        {tournament.status === 'ongoing' && tournament.type === 'online' && registrationStatus === 'completed' && (
          <a
            href={`https://lichess.org/tournament/${tournament.lichess_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 px-4 rounded-md text-sm font-semibold text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-md"
          >
            Join Tournament
          </a>
        )}
        {tournament.status === 'completed' && (
          <a
            href={`/student/tournament/${tournament.id}/results`}
            className="block w-full text-center py-2 px-4 rounded-md text-sm font-semibold text-secondary bg-white border border-secondary hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          >
            View Results
          </a>
        )}
      </div>
    </div>
  );
});

export default TournamentCard;
