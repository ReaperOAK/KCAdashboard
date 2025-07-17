

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TournamentsApi } from '../../api/tournaments';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/tournaments/LoadingSpinner';
import ErrorState from '../../components/tournaments/ErrorState';
import TournamentFilterBar from '../../components/tournaments/TournamentFilterBar';
import TournamentCard from '../../components/tournaments/TournamentCard';
import PaymentModal from '../../components/tournaments/PaymentModal';

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
        let response;
        if (activeFilter === 'all') {
          response = await TournamentsApi.getAll();
        } else {
          response = await TournamentsApi.getByStatus(activeFilter);
        }
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
        const response = await TournamentsApi.getRegistrations();
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

  // Fetch registration status for register/cancel/payment
  const fetchRegistrationStatus = useCallback(async () => {
    try {
      const response = await TournamentsApi.getRegistrations();
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
      TournamentsApi.register(tournament.id)
        .then(() => fetchRegistrationStatus())
        .catch(() => setError('Failed to register for tournament'));
    }
  }, [fetchRegistrationStatus]);

  // Cancel registration handler
  const handleCancelRegistration = useCallback((tournamentId) => {
    TournamentsApi.cancelRegistration(tournamentId)
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
      await TournamentsApi.initiatePayment(formData);
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
        loading={paymentLoading && selectedTournament?.id === tournament.id}
      />
    ))
  ), [tournaments, getRegistrationStatus, handleRegister, handleCancelRegistration, paymentLoading, selectedTournament]);

  return (
    <section className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary drop-shadow-sm tracking-tight">Chess <span className="text-accent">Tournaments</span></h1>
          <TournamentFilterBar filters={filters} activeFilter={activeFilter} onFilterChange={id => () => setActiveFilter(id)} />
        </header>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tournamentCards}
          </div>
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
    </section>
  );
});

export default TournamentsPage;
