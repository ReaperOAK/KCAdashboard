import React from 'react';
import RegistrationButton from './RegistrationButton';
import { CalendarDays, MapPin, Trophy, Users, User2 } from 'lucide-react';

/**
 * Card for displaying tournament details and actions.
 * Beautiful, responsive, and accessible.
 */
const statusStyles = {
  upcoming: 'bg-accent/10 text-accent',
  ongoing: 'bg-success/10 text-success',
  completed: 'bg-gray-light text-gray-dark',
};

const TournamentCard = ({ tournament, registrationStatus, onRegister, onCancel, loading }) => (
  <div className="bg-background-light dark:bg-background-dark rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-light transition-all duration-200 hover:shadow-xl group">
    <div className="p-6 flex-1 flex flex-col gap-2">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors duration-200">{tournament.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[tournament.status] || 'bg-gray-100 text-gray-800'}`}>{tournament.status}</span>
      </div>
      <p className="text-gray-dark mb-2 line-clamp-3">{tournament.description}</p>
      <div className="space-y-1 text-sm text-gray-dark">
        <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-accent" /> {new Date(tournament.date_time).toLocaleString()}</p>
        <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary" /> {tournament.location || 'Online'}</p>
        <p className="flex items-center gap-2"><span className="font-semibold">💰</span> Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
        <p className="flex items-center gap-2"><Trophy className="w-4 h-4 text-highlight" /> Prize Pool: ₹{tournament.prize_pool}</p>
        <p className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Participants: {tournament.participant_count || 0}{tournament.max_participants ? ` / ${tournament.max_participants}` : ''}</p>
        <p className="flex items-center gap-2"><User2 className="w-4 h-4 text-secondary" /> Organizer: {tournament.organizer_name}</p>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-light border-t flex flex-col gap-2">
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

export default React.memo(TournamentCard);
