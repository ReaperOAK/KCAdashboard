import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import { toast } from 'react-hot-toast';

const TournamentManagement = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/tournaments/get-all.php');
            setTournaments(response.tournaments);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch tournaments');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openModal = (tournament = null) => {
        if (tournament) {
            // Format date for the input field
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
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTournament(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingTournament) {
                // Update existing tournament
                await ApiService.post('/tournaments/update.php', {
                    id: editingTournament.id,
                    ...formData
                });
                toast.success('Tournament updated successfully');
            } else {
                // Create new tournament
                await ApiService.post('/tournaments/create.php', formData);
                toast.success('Tournament created successfully');
            }
            
            closeModal();
            fetchTournaments();
        } catch (error) {
            toast.error(error.message || 'Failed to save tournament');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tournament?')) {
            return;
        }
        
        try {
            await ApiService.post('/tournaments/delete.php', { id });
            toast.success('Tournament deleted successfully');
            fetchTournaments();
        } catch (error) {
            toast.error('Failed to delete tournament');
        }
    };

    const handleViewRegistrations = (id) => {
        window.location.href = `/admin/tournaments/${id}/registrations`;
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#200e4a]">Tournament Management</h1>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                >
                    Create Tournament
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="spinner"></div>
                    <p className="mt-3">Loading tournaments...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left">Title</th>
                                <th className="py-3 px-4 text-left">Date & Time</th>
                                <th className="py-3 px-4 text-left">Type</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Entry Fee</th>
                                <th className="py-3 px-4 text-left">Participants</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tournaments.map((tournament) => (
                                <tr key={tournament.id} className="border-t hover:bg-gray-50">
                                    <td className="py-3 px-4">{tournament.title}</td>
                                    <td className="py-3 px-4">
                                        {new Date(tournament.date_time).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 capitalize">{tournament.type}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs
                                                ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                                tournament.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'}`}
                                        >
                                            {tournament.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {tournament.entry_fee > 0 ? `₹${tournament.entry_fee}` : 'Free'}
                                    </td>
                                    <td className="py-3 px-4">
                                        {tournament.participant_count || 0} 
                                        {tournament.max_participants ? `/${tournament.max_participants}` : ''}
                                    </td>
                                    <td className="py-3 px-4 space-x-2">
                                        <button 
                                            onClick={() => handleViewRegistrations(tournament.id)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Registrations
                                        </button>
                                        <button 
                                            onClick={() => openModal(tournament)}
                                            className="px-3 py-1 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb]"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(tournament.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tournaments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-6 text-center text-gray-500">
                                        No tournaments found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Tournament Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative z-10">
                        <h2 className="text-xl font-bold mb-4 text-[#200e4a]">
                            {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
                        </h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows="3"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="date_time"
                                        value={formData.date_time}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Leave empty for online tournaments"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="offline">Offline</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee (₹)</label>
                                    <input
                                        type="number"
                                        name="entry_fee"
                                        value={formData.entry_fee}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        min="0"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool (₹)</label>
                                    <input
                                        type="number"
                                        name="prize_pool"
                                        value={formData.prize_pool}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        min="0"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                                    <input
                                        type="number"
                                        name="max_participants"
                                        value={formData.max_participants}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Set to 0 for unlimited participants</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lichess Tournament ID</label>
                                    <input
                                        type="text"
                                        name="lichess_id"
                                        value={formData.lichess_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="For online tournaments only"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb]"
                                >
                                    {editingTournament ? 'Update Tournament' : 'Create Tournament'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentManagement;
