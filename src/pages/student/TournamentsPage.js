
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

// Loading Spinner
const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
    <div className="animate-spin w-12 h-12 border-4 border-secondary border-t-transparent rounded-full mb-4" />
    <span className="text-gray-dark">Loading tournaments...</span>
  </div>
));

// Error State
const ErrorState = React.memo(({ message }) => (
  <div className="text-red-700 bg-red-50 border border-red-200 rounded p-6 text-center" role="alert">
    <span>{message}</span>
  </div>
));

// Tournament Filter Bar
const TournamentFilterBar = React.memo(({ filters, activeFilter, onFilterChange }) => (
  <div className="flex space-x-4" role="tablist" aria-label="Tournament filters">
    {filters.map(filter => (
      <button
        key={filter.id}
        type="button"
        onClick={onFilterChange(filter.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${activeFilter === filter.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
        role="tab"
        aria-selected={activeFilter === filter.id}
        tabIndex={activeFilter === filter.id ? 0 : -1}
      >
        {filter.label}
      </button>
    ))}
  </div>
));

// Registration Button/Status
const RegistrationButton = React.memo(({ tournament, registrationStatus, onRegister, onCancel }) => {
  if (registrationStatus === 'pending') {
    return (
      <div className="space-y-2">
        <span className="block text-sm text-amber-600 font-medium">Payment verification pending</span>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Cancel Registration
        </button>
      </div>
    );
  } else if (registrationStatus === 'completed') {
    return <span className="block text-sm text-green-600 font-medium">Registration confirmed ✓</span>;
  } else if (registrationStatus === 'refunded') {
    return <span className="block text-sm text-gray-600 font-medium">Registration cancelled (refunded)</span>;
  } else {
    return (
      <button
        type="button"
        onClick={onRegister}
        className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Register Now
      </button>
    );
  }
});

// Tournament Card
const TournamentCard = React.memo(({ tournament, registrationStatus, onRegister, onCancel }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-secondary">{tournament.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{tournament.status}</span>
      </div>
      <p className="text-gray-dark mb-4">{tournament.description}</p>
      <div className="space-y-2 text-sm text-gray-dark">
        <p>📅 {new Date(tournament.date_time).toLocaleString()}</p>
        <p>📍 {tournament.location || 'Online'}</p>
        <p>💰 Entry Fee: {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}</p>
        <p>🏆 Prize Pool: ₹{tournament.prize_pool}</p>
        <p>👥 Participants: {tournament.participant_count || 0}{tournament.max_participants ? ` / ${tournament.max_participants}` : ''}</p>
        <p>👤 Organizer: {tournament.organizer_name}</p>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-light border-t">
      {tournament.status === 'upcoming' && (
        <RegistrationButton
          tournament={tournament}
          registrationStatus={registrationStatus}
          onRegister={onRegister}
          onCancel={onCancel}
        />
      )}
      {tournament.status === 'ongoing' && tournament.type === 'online' && registrationStatus === 'completed' && (
        <a
          href={`https://lichess.org/tournament/${tournament.lichess_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 px-4 rounded-md text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Join Tournament
        </a>
      )}
      {tournament.status === 'completed' && (
        <a
          href={`/student/tournament/${tournament.id}/results`}
          className="block w-full text-center py-2 px-4 rounded-md text-sm font-medium text-secondary bg-white border border-secondary hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-accent"
        >
          View Results
        </a>
      )}
    </div>
  </div>
));

// Payment Modal
const PaymentModal = React.memo(({ tournament, open, onClose, onSubmit, onFileChange, paymentLoading }) => {
  if (!open || !tournament) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-primary">Payment for {tournament.title}</h2>
        <div className="mb-4 p-4 bg-gray-light rounded-lg">
          <p className="font-medium">Amount: ₹{tournament.entry_fee}</p>
          <p className="text-sm mt-2">Please make payment using UPI to:</p>
          <p className="font-bold mt-1">kca@upi</p>
          <div className="mt-4 flex justify-center">
            <img src="/qr-code-placeholder.png" alt="Payment QR Code" className="w-40 h-40 border border-gray-300" />
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="payment-screenshot">Upload Payment Screenshot:</label>
            <input
              id="payment-screenshot"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Please upload a screenshot of your successful payment</p>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={paymentLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={paymentLoading}
            >
              {paymentLoading ? 'Processing...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Main Page
export const TournamentsPage = React.memo(() => {
  useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [registrations, setRegistrations] = useState({});
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const filters = useMemo(() => [
    { id: 'all', label: 'All Tournaments' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' }
  ], []);

  // Fetch tournaments and registration status
  useEffect(() => {
    let isMounted = true;
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const endpoint = activeFilter === 'all'
          ? '/tournaments/get-all.php'
          : `/tournaments/get-by-status.php?status=${activeFilter}`;
        const response = await ApiService.get(endpoint);
        if (isMounted) setTournaments(response.tournaments);
        await fetchRegistrationStatus();
        if (isMounted) setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch tournaments');
          setLoading(false);
        }
      }
    };
    const fetchRegistrationStatus = async () => {
      try {
        const response = await ApiService.get('/tournaments/registration-status.php');
        const registrationMap = {};
        response.registrations.forEach(reg => {
          registrationMap[reg.tournament_id] = reg;
        });
        if (isMounted) setRegistrations(registrationMap);
      } catch (err) {
        // Silent fail
      }
    };
    fetchTournaments();
    return () => { isMounted = false; };
  }, [activeFilter]);

  // Memoized registration status getter
  const getRegistrationStatus = useCallback((tournamentId) => {
    return registrations[tournamentId]?.payment_status || null;
  }, [registrations]);

  // Register handler

  // Fetch registration status for register/cancel/payment
  const fetchRegistrationStatus = useCallback(async () => {
    try {
      const response = await ApiService.get('/tournaments/registration-status.php');
      const registrationMap = {};
      response.registrations.forEach(reg => {
        registrationMap[reg.tournament_id] = reg;
      });
      setRegistrations(registrationMap);
    } catch (err) {
      // Silent fail
    }
  }, []);

  // Register handler
  const handleRegister = useCallback((tournament) => {
    if (tournament.entry_fee > 0) {
      setSelectedTournament(tournament);
      setPaymentModal(true);
    } else {
      ApiService.post('/tournaments/register.php', { tournament_id: tournament.id })
        .then(() => fetchRegistrationStatus())
        .catch(() => setError('Failed to register for tournament'));
    }
  }, [fetchRegistrationStatus]);

  // Cancel registration handler
  const handleCancelRegistration = useCallback((tournamentId) => {
    ApiService.post('/tournaments/cancel-registration.php', { tournament_id: tournamentId })
      .then(() => fetchRegistrationStatus())
      .catch(() => setError('Failed to cancel registration'));
  }, [fetchRegistrationStatus]);

  // Payment modal close handler
  const handleClosePaymentModal = useCallback(() => {
    setPaymentModal(false);
    setSelectedTournament(null);
    setPaymentScreenshot(null);
  }, []);

  // Payment file change handler
  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
    }
  }, []);

  // Payment submit handler
  const handlePaymentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!paymentScreenshot) {
      setError('Please upload payment screenshot');
      return;
    }
    try {
      setPaymentLoading(true);
      const formData = new FormData();
      formData.append('tournament_id', selectedTournament.id);
      formData.append('payment_screenshot', paymentScreenshot);
      await ApiService.postFormData('/tournaments/payment-initiate.php', formData);
      handleClosePaymentModal();
      await fetchRegistrationStatus();
      setPaymentLoading(false);
    } catch (err) {
      setError('Failed to process payment');
      setPaymentLoading(false);
    }
  }, [paymentScreenshot, selectedTournament, handleClosePaymentModal, fetchRegistrationStatus]);

  // Tournament cards memoized
  const tournamentCards = useMemo(() => (
    tournaments.map((tournament) => (
      <TournamentCard
        key={tournament.id}
        tournament={tournament}
        registrationStatus={getRegistrationStatus(tournament.id)}
        onRegister={() => handleRegister(tournament)}
        onCancel={() => handleCancelRegistration(tournament.id)}
      />
    ))
  ), [tournaments, getRegistrationStatus, handleRegister, handleCancelRegistration]);

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Chess Tournaments</h1>
          <TournamentFilterBar filters={filters} activeFilter={activeFilter} onFilterChange={id => () => setActiveFilter(id)} />
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{tournamentCards}</div>
        )}
      </div>
      <PaymentModal
        tournament={selectedTournament}
        open={paymentModal}
        onClose={handleClosePaymentModal}
        onSubmit={handlePaymentSubmit}
        onFileChange={handleFileChange}
        paymentLoading={paymentLoading}
      />
    </div>
  );
});

export default TournamentsPage;
