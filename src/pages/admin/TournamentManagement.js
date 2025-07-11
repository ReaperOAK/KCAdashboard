import React, { useState, useEffect, useCallback } from 'react';
import { TournamentsApi } from '../../api/tournaments';
import { toast } from 'react-hot-toast';
import TournamentSkeleton from '../../components/tournaments/TournamentSkeleton';
import ErrorAlert from '../../components/tournaments/ErrorAlert';
import TournamentTable from '../../components/tournaments/TournamentTable';
import TournamentModal from '../../components/tournaments/TournamentModal';

const TournamentManagement = React.memo(function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    type: 'offline',
    entry_fee: 0,
    prize_pool: 0,
    max_participants: 0,
    status: 'upcoming',
    lichess_id: ''
  });

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TournamentsApi.getAll();
      // If API returns { tournaments: [...] }, extract the array
      setTournaments(Array.isArray(data.tournaments) ? data.tournaments : (Array.isArray(data) ? data : []));
    } catch (error) {
      setError('Failed to fetch tournaments.');
      toast.error('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOpenModal = useCallback((tournament = null) => {
    if (tournament) {
      const dateObj = new Date(tournament.date_time);
      const formattedDate = dateObj.toISOString().slice(0, 16);
      setEditingTournament(tournament);
      setFormData({
        title: tournament.title,
        description: tournament.description,
        date_time: formattedDate,
        location: tournament.location || '',
        type: tournament.type,
        entry_fee: tournament.entry_fee || 0,
        prize_pool: tournament.prize_pool || 0,
        max_participants: tournament.max_participants || 0,
        status: tournament.status,
        lichess_id: tournament.lichess_id || ''
      });
    } else {
      setEditingTournament(null);
      setFormData({
        title: '',
        description: '',
        date_time: '',
        location: '',
        type: 'offline',
        entry_fee: 0,
        prize_pool: 0,
        max_participants: 0,
        status: 'upcoming',
        lichess_id: ''
      });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTournament(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (editingTournament) {
        await TournamentsApi.update(editingTournament.id, formData);
        toast.success('Tournament updated successfully');
      } else {
        await TournamentsApi.create(formData);
        toast.success('Tournament created successfully');
      }
      handleCloseModal();
      fetchTournaments();
    } catch (error) {
      toast.error(error.message || 'Failed to save tournament');
    }
  }, [editingTournament, formData, fetchTournaments, handleCloseModal]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await TournamentsApi.delete(id);
      toast.success('Tournament deleted successfully');
      fetchTournaments();
    } catch (error) {
      toast.error('Failed to delete tournament');
    }
  }, [fetchTournaments]);

  const handleViewRegistrations = useCallback((id) => {
    window.location.href = `/admin/tournaments/${id}/registrations`;
  }, []);

  return (
    <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Tournament Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none w-full sm:w-auto"
        >
          Create Tournament
        </button>
      </div>
      {error && <ErrorAlert message={error} />}
      {loading ? (
        <TournamentSkeleton />
      ) : (
        <TournamentTable
          tournaments={tournaments}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onViewRegistrations={handleViewRegistrations}
        />
      )}
      <TournamentModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        editingTournament={editingTournament}
      />
    </div>
  );
});

export default TournamentManagement;
