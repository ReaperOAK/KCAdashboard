import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import { toast } from 'react-hot-toast';

// Skeleton loader
const TournamentSkeleton = React.memo(() => (
  <div className="text-center py-10 animate-pulse" aria-busy="true" aria-label="Loading tournaments">
    <div className="h-8 w-1/3 mx-auto bg-gray-200 rounded mb-4" />
    <div className="h-32 bg-white rounded-lg shadow-lg mx-auto w-full max-w-4xl" />
  </div>
));

// Error alert
const ErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border-l-4 border-red-800 text-white px-6 py-4 rounded mb-6" role="alert" aria-live="assertive">
    {message}
  </div>
));

// Table row for tournament
const TournamentRow = React.memo(({ tournament, onEdit, onDelete, onViewRegistrations }) => {
  const statusClass = useMemo(() => {
    switch (tournament.status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  }, [tournament.status]);
  return (
    <tr className="border-t hover:bg-gray-light focus-within:bg-gray-light" tabIndex={0}>
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
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          aria-label={`View registrations for ${tournament.title}`}
        >
          Registrations
        </button>
        <button
          onClick={() => onEdit(tournament)}
          className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none"
          aria-label={`Edit ${tournament.title}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(tournament.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
          aria-label={`Delete ${tournament.title}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

// Tournament table
const TournamentTable = React.memo(({ tournaments, onEdit, onDelete, onViewRegistrations }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg" aria-label="Tournaments">
      <thead className="bg-primary">
        <tr>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Title</th>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Date & Time</th>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Type</th>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Status</th>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Entry Fee</th>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Participants</th>
          <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white text-xs sm:text-sm uppercase">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tournaments.length === 0 ? (
          <tr>
            <td colSpan="7" className="py-6 text-center text-gray-dark">No tournaments found. Create one to get started.</td>
          </tr>
        ) : (
          tournaments.map((tournament) => (
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
));

// Tournament modal (create/edit)
const TournamentModal = React.memo(({ open, onClose, onSubmit, formData, onInputChange, editingTournament }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl relative z-10">
        <h2 className="text-xl font-bold mb-4 text-primary">{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date_time">Date & Time</label>
              <input
                id="date_time"
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                placeholder="Leave empty for online tournaments"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="entry_fee">Entry Fee (₹)</label>
              <input
                id="entry_fee"
                type="number"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="prize_pool">Prize Pool (₹)</label>
              <input
                id="prize_pool"
                type="number"
                name="prize_pool"
                value={formData.prize_pool}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="max_participants">Max Participants</label>
              <input
                id="max_participants"
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Set to 0 for unlimited participants</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lichess_id">Lichess Tournament ID</label>
              <input
                id="lichess_id"
                type="text"
                name="lichess_id"
                value={formData.lichess_id}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="For online tournaments only"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none"
            >
              {editingTournament ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

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
      const response = await ApiService.get('/tournaments/get-all.php');
      setTournaments(response.tournaments);
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
        await ApiService.post('/tournaments/update.php', {
          id: editingTournament.id,
          ...formData
        });
        toast.success('Tournament updated successfully');
      } else {
        await ApiService.post('/tournaments/create.php', formData);
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
      await ApiService.post('/tournaments/delete.php', { id });
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
